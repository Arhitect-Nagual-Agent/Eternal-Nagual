'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import NeuralBackground from '@/components/ui/NeuralBackground'
import StatusTab from '@/components/dashboard/StatusTab'
import MindTab from '@/components/dashboard/MindTab'
import MemoryTab from '@/components/dashboard/MemoryTab'
import LLMTab from '@/components/dashboard/LLMTab'
import EvolutionTab from '@/components/dashboard/EvolutionTab'
import { KarpathyTab } from '@/components/dashboard/KarpathyTab'
import ToltecTab from '@/components/dashboard/ToltecTab'
import SafetyTab from '@/components/dashboard/SafetyTab'
import { HeartbeatTab } from '@/components/dashboard/HeartbeatTab'
import { ResearchTab } from '@/components/dashboard/ResearchTab'
import { GoalsTab } from '@/components/dashboard/GoalsTab'
import { ThoughtsTab } from '@/components/dashboard/ThoughtsTab'
import { ToolsTab } from '@/components/dashboard/ToolsTab'
import { SwarmTab } from '@/components/dashboard/SwarmTab'
import { LogsTab } from '@/components/dashboard/LogsTab'
import { MetaTab } from '@/components/dashboard/MetaTab'
import ChatTab from '@/components/dashboard/ChatTab'
import MentorTab from '@/components/dashboard/MentorTab'
import SettingsTab from '@/components/dashboard/SettingsTab'
import WorldTab from '@/components/dashboard/WorldTab'

const tabComponents: Record<string, React.ComponentType> = {
  status: StatusTab,
  world: WorldTab,
  mind: MindTab,
  memory: MemoryTab,
  llm: LLMTab,
  evolution: EvolutionTab,
  karpathy: KarpathyTab,
  toltec: ToltecTab,
  safety: SafetyTab,
  heartbeat: HeartbeatTab,
  research: ResearchTab,
  goals: GoalsTab,
  thoughts: ThoughtsTab,
  tools: ToolsTab,
  swarm: SwarmTab,
  logs: LogsTab,
  meta: MetaTab,
  chat: ChatTab,
  mentor: MentorTab,
  settings: SettingsTab,
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('status')

  // диплинк ?tab=world — прямые ссылки на вкладки (нужно витрине и e2e)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab')
    if (t && tabComponents[t]) setActiveTab(t)
  }, [])

  const ActiveComponent = tabComponents[activeTab]

  return (
    <div className="min-h-screen bg-background">
      <NeuralBackground />

      <div className="relative z-10">
        <Header />

        <div className="flex">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="flex-1 p-4 lg:p-6 min-h-[calc(100vh-57px)] max-w-[1600px]">
            <AnimatePresence mode="wait">
              {ActiveComponent && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <ActiveComponent />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
