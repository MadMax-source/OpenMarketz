'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Headset, Mail, MessageSquareText, X } from 'lucide-react'
import { LiveChat } from '@/components/support/live-chat'
import { ComplaintForm } from '@/components/support/complaint-form'
import { WhatsAppIcon, WHATSAPP_URL, WHATSAPP_DISPLAY } from '@/components/support/whatsapp'
import { cn } from '@/lib/utils'

type Tab = 'chat' | 'whatsapp' | 'email'

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'chat', label: 'Live chat', icon: MessageSquareText },
  { id: 'whatsapp', label: 'WhatsApp', icon: WhatsAppIcon },
  { id: 'email', label: 'Email us', icon: Mail },
]

export function SupportWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('chat')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (pathname === '/support') return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            id="support-panel"
            role="dialog"
            aria-label="Customer support"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="flex max-h-[min(640px,calc(100dvh-6rem))] w-[calc(100vw-2rem)] origin-bottom-right flex-col overflow-hidden rounded-3xl border bg-card shadow-2xl sm:w-[380px]"
          >
            <header className="flex items-center gap-3 bg-foreground p-4 text-background">
              <span className="relative size-10 shrink-0">
                <Image src="/images/support-agent.png" alt="" fill sizes="40px" className="rounded-full object-cover" />
                <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-foreground bg-primary" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">OpenMarketz support</p>
                <p className="text-xs text-background/70">We usually reply in ~2 minutes</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close support" className="flex size-8 items-center justify-center rounded-full hover:bg-background/10">
                <X className="size-4" />
              </button>
            </header>

            <div role="tablist" aria-label="Support channels" className="grid grid-cols-3 gap-1 border-b p-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    'flex h-9 items-center justify-center gap-1.5 rounded-xl text-xs font-medium text-muted-foreground transition-colors hover:text-foreground',
                    tab === id && 'bg-muted text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto">
              {tab === 'chat' && <LiveChat compact className="h-[420px] rounded-none border-0" />}
              {tab === 'whatsapp' && <WhatsAppPanel />}
              {tab === 'email' && (
                <div className="p-4">
                  <ComplaintForm compact />
                </div>
              )}
            </div>

            <Link href="/support" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1 border-t py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              Visit the help center
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {!open && (
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
          >
            <WhatsAppIcon className="size-6" />
          </a>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="support-panel"
          className="flex h-14 items-center gap-2 rounded-full bg-primary pl-4 pr-5 font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.03]"
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Headset className="size-5" aria-hidden="true" />}
          <span className="text-sm">{open ? 'Close' : 'Need help?'}</span>
        </button>
      </div>
    </div>
  )
}

function WhatsAppPanel() {
  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-[#25D366]/15 text-[#128C4B]">
        <WhatsAppIcon className="size-8" />
      </span>
      <div>
        <h3 className="font-display text-lg font-semibold">Chat with our WhatsApp team</h3>
        <p className="mt-1 text-sm text-muted-foreground">{'Available 8am – 10pm daily. Send us your order number for faster help.'}</p>
      </div>
      <p className="rounded-xl bg-muted px-4 py-2 font-mono text-sm">{WHATSAPP_DISPLAY}</p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white hover:opacity-90"
      >
        <WhatsAppIcon className="size-5" />
        Open WhatsApp
      </a>
    </div>
  )
}
