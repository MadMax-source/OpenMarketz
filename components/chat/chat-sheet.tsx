'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { getSeller, type Product } from '@/lib/data'
import { useShop } from '@/components/shop-provider'
import { ChatThread } from '@/components/chat/chat-thread'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function ChatSheet({ product, className }: { product: Product; className?: string }) {
  const { openConversation, conversations } = useShop()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const seller = getSeller(product.sellerId)
  const conversation = conversations.find((c) => c.id === conversationId)

  return (
    <Sheet onOpenChange={(open) => open && setConversationId(openConversation(product))}>
      <SheetTrigger className={className}>
        <MessageCircle className="size-4" aria-hidden="true" />
        Chat seller
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {seller?.initials}
            </span>
            <span className="flex flex-col">
              <span>{seller?.name}</span>
              <SheetDescription className="text-xs font-normal">
                {`Typically replies ${seller?.responseTime ?? 'quickly'}`}
              </SheetDescription>
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1">{conversation && <ChatThread conversation={conversation} />}</div>
      </SheetContent>
    </Sheet>
  )
}
