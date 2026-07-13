'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Bot, User, Loader2, Paperclip, Mic, Square } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { GradientButton } from '@/components/ui/GradientButton';
import { useChat } from '@/hooks/useNagualAPI';
import type { ChatMessage } from '@/lib/types';
import { useT } from '@/lib/i18n';

const CHAT_STORAGE_KEY = 'nagual_chat_history';

export default function ChatTab() {
  const t = useT();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatMutation = useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) setPendingFile(file);   // прикрепить — отправится ВМЕСТЕ с текстом по кнопке
    inputRef.current?.focus();
  };

  // Ctrl+V: вставка изображения из буфера (скрины постов и т.п.) → прикрепляется к сообщению
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of Array.from(items)) {
        if (it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) {
            setPendingFile(new File([f], `скрин_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.png`, { type: f.type }));
            e.preventDefault();
            break;
          }
        }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '\u{1F3A4} \u0413\u043E\u043B\u043E\u0441 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 HTTPS: \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u0434\u0430\u0451\u0442 \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D \u043D\u0430 http-\u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435.',
          model: 'system',
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        if (blob.size < 1000) return;
        setIsSending(true);
        try {
          const fd = new FormData();
          fd.append('file', blob, 'voice.webm');
          const res = await fetch('/api/nagual/voice', { method: 'POST', body: fd });
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            {
              role: 'user',
              content: `\u{1F3A4} ${data.text || '(\u043D\u0435 \u0440\u0430\u0441\u0441\u043B\u044B\u0448\u0430\u043B)'}`,
              timestamp: new Date().toISOString(),
            },
            {
              role: 'assistant',
              content: data.response || data.error || '\u2026',
              timestamp: new Date().toISOString(),
            },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: t('chat.error'), model: 'error', timestamp: new Date().toISOString() },
          ]);
        } finally {
          setIsSending(false);
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch {
      /* microphone denied */
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isSending]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Restore chat history on mount: localStorage first (instant), then backend (authoritative, survives restarts)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CHAT_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {
      /* ignore corrupt cache */
    }
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/nagual/chat');
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data?.history) || !data.history.length) return;
        const restored: ChatMessage[] = data.history.map(
          (m: { role: string; content: string; model?: string; ts?: string; timestamp?: string }) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
            model: m.model,
            timestamp: m.timestamp || m.ts,
          })
        );
        // МЕРЖ вместо перезаписи (Костя 02.07: «переключил вкладку — всё слетело»):
        // свежие локальные user-сообщения, которых ещё нет на бэке (ответ в пути), не теряем;
        // ответ придёт сюда же следующим поллингом. Старше 10 мин — доверяем бэку.
        setMessages((prev) => {
          const seen = new Set(restored.map((m) => 'user|' + String(m.content || '').slice(0, 180)));
          const tail = prev.filter((m) =>
            m.role === 'user' &&
            Date.now() - (Date.parse(m.timestamp || '') || 0) < 600000 &&
            !seen.has('user|' + String(m.content || '').slice(0, 180))
          );
          return [...restored, ...tail];
        });
      } catch {
        /* backend offline — keep localStorage copy */
      }
    };
    loadHistory();
    const hTimer = setInterval(loadHistory, 5000);   // ответ подтягивается САМ, вкладку можно покидать
    return () => clearInterval(hTimer);
  }, []);

  // Mirror history to localStorage so a page reload never loses the conversation
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-100)));
    } catch {
      /* storage full / unavailable */
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (isSending) return;
    if (pendingFile) {
      const f = pendingFile;
      setPendingFile(null);
      setMessages((prev) => [...prev, { role: 'user', content: `\u{1F4CE} ${f.name}${trimmed ? ' \u2014 ' + trimmed : ''}`, timestamp: new Date().toISOString() }]);
      setInput('');
      setIsSending(true);
      try {
        const fd = new FormData();
        fd.append('file', f, f.name);
        if (trimmed) fd.append('caption', trimmed);
        const res = await fetch('/api/nagual/upload', { method: 'POST', body: fd });
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response || data.error || '\u2026', timestamp: new Date().toISOString() }]);
      } catch {
        setMessages((prev) => [...prev, { role: 'assistant', content: t('chat.error'), model: 'error', timestamp: new Date().toISOString() }]);
      } finally {
        setIsSending(false);
        inputRef.current?.focus();
      }
      return;
    }
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsSending(true);

    try {
      const response = await chatMutation.mutateAsync(updatedMessages);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        model: response.model,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: t('chat.error'),
        model: 'error',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="transition-all duration-300 flex flex-col">
      {/* Chat Header */}
      <div className="px-6 py-4 gradient-border-bottom">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t('chat.title')}</h3>
            <p className="text-[10px] text-muted-foreground">{t('chat.subtitle')}</p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 text-[10px] px-2 py-0.5">
              {t('status.online')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[500px] chat-scroll" ref={scrollRef}>
          <div className="p-4 space-y-4">
            {messages.length === 0 && (
              <motion.div
                className="flex flex-col items-center justify-center h-64 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10 mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('chat.empty.title')}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {t('chat.empty.hint')}
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-2.5 max-w-[80%] min-w-0 ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 mt-1 p-1.5 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-white'
                          : 'bg-gradient-to-br from-[#4527a0] to-[#0f766e] text-white'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className="space-y-1.5 min-w-0 max-w-full">
                      <div
                        className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white rounded-br-sm'
                            : 'bg-gradient-to-br from-[#1e1745] via-[#14243e] to-[#0d3a3a] text-[#e9e4fa] border border-[#7C3AED]/30 shadow-[0_0_14px_rgba(124,58,237,.12)] rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      {msg.role === 'assistant' && msg.model && (
                        <div className="flex items-center gap-2 px-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 font-mono"
                          >
                            {msg.model}
                          </Badge>
                          {msg.timestamp && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      )}
                      {msg.role === 'user' && msg.timestamp && (
                        <div className="flex justify-end px-1">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isSending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2.5 max-w-[80%]">
                    <div className="shrink-0 mt-1 p-1.5 rounded-lg bg-muted text-muted-foreground">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-card border border-border rounded-xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                        <div className="flex gap-1">
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                          />
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="px-4 py-3 gradient-border-bottom">
        {pendingFile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.4)', borderRadius: 10, padding: '6px 10px', fontSize: 12 }}>
            <span>📎 {pendingFile.name}</span>
            <span style={{ color: '#8a86a8', fontSize: 10.5 }}>— допиши комментарий и отправь</span>
            <span onClick={() => setPendingFile(null)} style={{ cursor: 'pointer', marginLeft: 'auto', color: '#ef5350' }}>✕</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePicked} />
          <GradientButton
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            size="sm"
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </GradientButton>
          <GradientButton
            onClick={toggleRecording}
            disabled={isSending}
            size="sm"
            className={`shrink-0 ${isRecording ? 'animate-pulse ring-2 ring-red-500' : ''}`}
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </GradientButton>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            disabled={isSending}
            className="flex-1 bg-muted/50 border-border focus-visible:ring-primary/30"
          />
          <GradientButton
            onClick={handleSend}
            disabled={isSending || (!input.trim() && !pendingFile)}
            size="sm"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </GradientButton>
        </div>
      </div>
    </Card>
  );
}
