'use client'

import { useState, useCallback } from 'react'
import {
  Brain,
  Flame,
  Eye,
  Database,
  Cpu,
  Dna,
  FlaskConical,
  Search,
  Shield,
  Heart,
  Wrench,
  Users,
  FileText,
  Settings,
  MessageSquare,
  Target,
  Lightbulb,
  Globe,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useT } from '@/lib/i18n'

interface NavItem {
  id: string
  icon: React.ElementType
  count?: number
}

interface NavSection {
  // sectionKey maps to i18n: section.<sectionKey>; item label maps to nav.<id>
  sectionKey: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    sectionKey: 'consciousness',
    items: [
      { id: 'world', icon: Globe },
      { id: 'mind', icon: Brain },
      { id: 'toltec', icon: Flame },
      { id: 'meta', icon: Eye },
    ],
  },
  {
    sectionKey: 'memory',
    items: [{ id: 'memory', icon: Database, count: 12 }],
  },
  {
    sectionKey: 'cognition',
    items: [{ id: 'llm', icon: Cpu }],
  },
  {
    sectionKey: 'evolution',
    items: [
      { id: 'evolution', icon: Dna },
      { id: 'karpathy', icon: FlaskConical },
      { id: 'research', icon: Search, count: 5 },
    ],
  },
  {
    sectionKey: 'resilience',
    items: [
      { id: 'safety', icon: Shield },
      { id: 'heartbeat', icon: Heart },
    ],
  },
  {
    sectionKey: 'infrastructure',
    items: [
      { id: 'tools', icon: Wrench },
      { id: 'swarm', icon: Users, count: 3 },
      { id: 'logs', icon: FileText },
      { id: 'settings', icon: Settings },
    ],
  },
  {
    sectionKey: 'interaction',
    items: [
      { id: 'chat', icon: MessageSquare, count: 8 },
      { id: 'mentor', icon: GraduationCap },
      { id: 'goals', icon: Target },
      { id: 'thoughts', icon: Lightbulb },
    ],
  },
]

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

function NavItemButton({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
}) {
  const t = useT()
  const Icon = item.icon
  const label = t(`nav.${item.id}`)

  const button = (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        isActive
          ? 'bg-primary/10 text-primary border-l-[3px] border-primary -ml-[3px] pl-[calc(0.75rem-3px)]'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
        isCollapsed && 'justify-center px-2 border-l-0 ml-0 pl-2'
      )}
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-primary' : '')} />
      {!isCollapsed && (
        <>
          <span className="truncate">{label}</span>
          {item.count !== undefined && (
            <Badge
              variant="secondary"
              className="ml-auto text-[10px] px-1.5 py-0 h-4 min-w-[20px] justify-center font-normal"
            >
              {item.count}
            </Badge>
          )}
        </>
      )}
      {isCollapsed && item.count !== undefined && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold">
          {item.count > 9 ? '9+' : item.count}
        </span>
      )}
    </button>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">{button}</div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const t = useT()
  const [collapsed, setCollapsed] = useState(false)

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  return (
    <aside
      className={cn(
        'sticky top-14 h-[calc(100vh-56px)] gradient-border-right bg-background/95 backdrop-blur-sm flex flex-col transition-all duration-200 ease-in-out overflow-hidden',
        collapsed ? 'w-16' : 'w-[260px]'
      )}
    >
      {/* Toggle button */}
      <div className="flex items-center justify-end px-2 py-2 flex-shrink-0">
        <button
          onClick={handleToggle}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      <Separator className="flex-shrink-0" />

      {/* Scrollable navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-2 px-2">
        {navSections.map((section, sectionIdx) => (
          <div key={section.sectionKey} className="mb-3">
            {!collapsed && (
              <h3 className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                {t(`section.${section.sectionKey}`)}
              </h3>
            )}
            {collapsed && sectionIdx > 0 && <Separator className="mb-2" />}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItemButton
                  key={item.id}
                  item={item}
                  isActive={activeTab === item.id}
                  isCollapsed={collapsed}
                  onClick={() => onTabChange(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Version info footer */}
      <Separator className="flex-shrink-0" />
      <div
        className={cn(
          'px-3 py-2.5 text-[10px] text-muted-foreground/60 font-mono flex-shrink-0',
          collapsed && 'text-center px-1'
        )}
      >
        {collapsed ? <span>v2.0</span> : <span>v2.0.0 | 94 {t('sidebar.modules')}</span>}
      </div>
    </aside>
  )
}
