# 🚀 Installation Guide — Eternal Nagual v2.0.0

## Prerequisites
- **OS:** Ubuntu 20.04+ (tested on 24.04)
- **RAM:** 2GB minimum, 4GB recommended
- **Python:** 3.11+ (script installs venv automatically)
- **Root access** required
- **Internet** connection for API calls

## Step 1: Get the Deploy Script
```bash
# Clone from GitHub
git clone https://github.com/Arhitect-Nagual-Agent/eternal-nagual.git
cd eternal-nagual

# Or download directly
wget https://raw.githubusercontent.com/Arhitect-Nagual-Agent/eternal-nagual/main/deploy.sh
```

## Step 2: Deploy
```bash
bash deploy.sh
```
This will:
- Create `/root/nagual/` with all subdirectories
- Install Python venv and dependencies (httpx, python-dotenv, fastapi, uvicorn, pypdf, python-docx)
- Write `config.env` with placeholder API keys
- Deploy `core.py` (the entire agent)
- Embed default SOUL.md, rules, and goals
- Create and start systemd service

## Step 3: Configure API Keys
```bash
nano /root/nagual/config.env
```
Replace `YOUR_*_HERE` values with real API keys:
- **Required:** At least one LLM provider (NVIDIA, Google AI Studio, or OpenRouter)
- **Recommended:** BRAVE_API_KEY for web search
- **Optional:** Telegram bot token, ElevenLabs, GitHub repo URL

### LLM Provider Setup

| Provider | How to Get Key | Config Variable |
|----------|---------------|-----------------|
| OpenRouter | [openrouter.ai](https://openrouter.ai) | `OPENROUTER_API_KEY` |
| NVIDIA NIM | [build.nvidia.com](https://build.nvidia.com) | `NVIDIA_API_KEY` |
| Google AI Studio | [aistudio.google.com](https://aistudio.google.com) | `GOOGLE_API_KEY` |
| Anthropic | [console.anthropic.com](https://console.anthropic.com) | `ANTHROPIC_API_KEY` |
| OpenAI | [platform.openai.com](https://platform.openai.com) | `OPENAI_API_KEY` |
| xAI (Grok) | [console.x.ai](https://console.x.ai) | `XAI_API_KEY` |
| DeepSeek | [platform.deepseek.com](https://platform.deepseek.com) | `DEEPSEEK_API_KEY` |
| Moonshot | [moonshot.cn](https://moonshot.cn) | `MOONSHOT_API_KEY` |
| MiMo | [mimo.ai](https://mimo.ai) | `MIMO_API_KEY` |

### Telegram Setup
1. Create a bot via [@BotFather](https://t.me/BotFather)
2. Get your chat ID via [@userinfobot](https://t.me/userinfobot)
3. Set `TG_TOKEN` and `TG_CHAT_ID` in config.env

## Step 4: Restart After Config
```bash
systemctl restart nagual
```

## Step 5: Access Dashboard
Open in browser:
```
http://YOUR_SERVER_IP:8000
```

## Useful Commands
```bash
# Check status
systemctl status nagual

# View live logs
journalctl -u nagual -f

# Restart
systemctl restart nagual

# Stop
systemctl stop nagual

# Edit config
nano /root/nagual/config.env
```

## Optional: PyTorch
For neural sacred geometry modules:
```bash
cd /root/nagual
source venv/bin/activate
pip install torch --index-url https://download.pytorch.org/whl/cpu
systemctl restart nagual
```

## Optional: Vector Memory (ChromaDB)
```bash
cd /root/nagual
source venv/bin/activate
pip install chromadb sentence-transformers
systemctl restart nagual
```

## Troubleshooting
- **"No LLM slots available"** — Configure at least one API key in config.env
- **Dashboard not loading** — Check `ufw allow 8000` firewall rule
- **Telegram not responding** — Verify TG_TOKEN and TG_CHAT_ID
- **Memory errors** — Nagual needs at least 2GB RAM
