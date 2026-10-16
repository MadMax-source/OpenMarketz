'use client'

import { Clock, Mail, MessageSquareText, Phone, ShieldCheck } from 'lucide-react'
import { LiveChat } from '@/components/support/live-chat'
import { ComplaintForm, SUPPORT_EMAIL } from '@/components/support/complaint-form'
import { WhatsAppIcon, WHATSAPP_DISPLAY, WHATSAPP_URL } from '@/components/support/whatsapp'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  { q: 'How do I track my order?', a: 'Open Orders from the top bar and select the order. You will see each delivery step, the courier and the expected delivery date.' },
  { q: 'How does bargaining work?', a: 'On any negotiable product, tap "Make an offer". The seller can accept, decline or counter. Accepted prices apply automatically at checkout.' },
  { q: 'What is the Open Market?', a: 'Post what you need with your budget and verified sellers send you offers. Compare, chat and accept the best one — payment is held in escrow until delivery.' },
  { q: 'When do I get a refund?', a: 'Refunds for items not as described are processed within 3–5 business days after the return is confirmed by our delivery team.' },
  { q: 'How do sellers get paid?', a: 'Once the buyer confirms delivery (or 48 hours after delivery with no dispute), the payout is sent to the seller’s bank account.' },
]

export function SupportView() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 md:px-6 md:py-14">
      <header className="flex max-w-2xl flex-col gap-3">
        <p className="text-sm font-medium text-primary">Help & support</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl">How can we help you today?</h1>
        <p className="text-pretty text-muted-foreground">Chat with our team live, message us on WhatsApp or send us a complaint by email. Real people, every day of the week.</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-3">
        <ChannelCard icon={<MessageSquareText className="size-5" />} title="Live chat" body="Average reply in 2 minutes" href="#chat" cta="Start chatting" />
        <ChannelCard icon={<WhatsAppIcon className="size-5" />} title="WhatsApp" body={WHATSAPP_DISPLAY} href={WHATSAPP_URL} cta="Open WhatsApp" external />
        <ChannelCard icon={<Mail className="size-5" />} title="Email" body={SUPPORT_EMAIL} href="#complaint" cta="Send a complaint" />
      </ul>

      <div className="grid gap-8 lg:grid-cols-2">
        <div id="chat" className="scroll-mt-28">
          <LiveChat />
        </div>
        <section id="complaint" aria-labelledby="complaint-title" className="scroll-mt-28 rounded-3xl border bg-card p-6">
          <h2 id="complaint-title" className="font-display text-2xl font-semibold">Send us a complaint</h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">We will open a ticket and reply to your email within 24 hours.</p>
          <ComplaintForm />
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section aria-labelledby="faq-title">
          <h2 id="faq-title" className="mb-3 font-display text-2xl font-semibold">Frequently asked questions</h2>
          <Accordion className="rounded-2xl border bg-card px-5">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="py-4 text-left text-sm font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <aside className="flex flex-col gap-4 rounded-2xl bg-muted/60 p-5 text-sm">
          <p className="flex items-center gap-3"><Clock className="size-4 text-primary" aria-hidden="true" />Support hours: 8am – 10pm daily</p>
          <p className="flex items-center gap-3"><Phone className="size-4 text-primary" aria-hidden="true" />{`Call: ${WHATSAPP_DISPLAY}`}</p>
          <p className="flex items-center gap-3"><ShieldCheck className="size-4 text-primary" aria-hidden="true" />Never share your password or card PIN with anyone, including support.</p>
        </aside>
      </div>
    </div>
  )
}

function ChannelCard({ icon, title, body, href, cta, external }: { icon: React.ReactNode; title: string; body: string; href: string; cta: string; external?: boolean }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</span>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="mt-auto text-sm font-semibold text-primary hover:underline">
        {cta}
      </a>
    </li>
  )
}
