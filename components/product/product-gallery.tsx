'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

type Media = { type: 'video' | 'image'; src: string }

export function ProductGallery({ images, name, video }: { images: string[]; name: string; video?: string }) {
  const media: Media[] = [
    ...(video ? [{ type: 'video' as const, src: video }] : []),
    ...images.map((src) => ({ type: 'image' as const, src })),
  ]
  const [active, setActive] = useState(0)
  const current = media[active]

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {media.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto md:flex-col" role="tablist" aria-label="Product media">
          {media.map((item, i) => (
            <button
              key={item.src}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={item.type === 'video' ? 'Play product video' : `Show photo ${i}`}
              onClick={() => setActive(i)}
              className={cn(
                'relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted ring-2 ring-offset-2 ring-offset-background transition-all md:size-20',
                active === i ? 'ring-primary' : 'ring-transparent opacity-70 hover:opacity-100',
              )}
            >
              <Image src={item.type === 'video' ? images[0] : item.src} alt="" fill sizes="80px" className="object-cover" />
              {item.type === 'video' && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-foreground/45 text-background">
                  <Play className="size-5 fill-current" aria-hidden="true" />
                  <span className="text-[10px] font-medium">Video</span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-square flex-1 overflow-hidden rounded-3xl bg-muted">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.src}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            {current.type === 'video' ? (
              <video
                src={current.src}
                poster={images[0]}
                autoPlay
                muted
                loop
                playsInline
                controls
                aria-label={`${name} product video`}
                className="size-full object-cover"
              />
            ) : (
              <Image
                src={current.src || '/placeholder.svg'}
                alt={name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>
        {current.type === 'video' && (
          <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="size-1.5 rounded-full bg-deal" aria-hidden="true" />
            Product clip
          </span>
        )}
      </div>
    </div>
  )
}
