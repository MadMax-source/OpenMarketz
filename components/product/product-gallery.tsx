'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 md:flex-col" role="tablist" aria-label="Product images">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                'relative size-16 overflow-hidden rounded-xl bg-muted ring-2 ring-offset-2 ring-offset-background transition-all md:size-20',
                active === i ? 'ring-primary' : 'ring-transparent opacity-70 hover:opacity-100',
              )}
            >
              <Image src={src || '/placeholder.svg'} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-square flex-1 overflow-hidden rounded-3xl bg-muted">
        <AnimatePresence mode="wait">
          <motion.div
            key={images[active]}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image
              src={images[active] || '/placeholder.svg'}
              alt={name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
