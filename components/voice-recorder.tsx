'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export type VoiceNote = { url: string; duration: number }

export const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function VoiceRecorder({
  value,
  onChange,
  maxSeconds = 60,
}: {
  value?: VoiceNote
  onChange: (note: VoiceNote | undefined) => void
  maxSeconds?: number
}) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<number | null>(null)
  const startRef = useRef(0)

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop())
  }, [])

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const duration = (Date.now() - startRef.current) / 1000
        onChange({ url: URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType })), duration })
      }
      recorderRef.current = recorder
      startRef.current = Date.now()
      recorder.start()
      setRecording(true)
      setElapsed(0)
      timerRef.current = window.setInterval(() => {
        const secs = (Date.now() - startRef.current) / 1000
        setElapsed(secs)
        if (secs >= maxSeconds) stop()
      }, 250)
    } catch {
      toast.error('Microphone unavailable', { description: 'Allow microphone access or type your message instead.' })
    }
  }

  function stop() {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    setRecording(false)
  }

  if (value && !recording) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border bg-muted/50 p-2 pl-3">
        <audio src={value.url} controls className="h-9 min-w-0 flex-1" aria-label="Your voice note" />
        <span className="text-xs tabular-nums text-muted-foreground">{formatDuration(value.duration)}</span>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label="Delete voice note"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-deal"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      aria-pressed={recording}
      className={cn(
        'flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed text-sm transition-colors',
        recording ? 'border-deal bg-deal/5 text-deal' : 'hover:border-foreground/40 hover:bg-muted/50',
      )}
    >
      {recording ? (
        <>
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-deal opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-deal" />
          </span>
          <span className="tabular-nums">{`Recording ${formatDuration(elapsed)}`}</span>
          <Square className="size-3.5 fill-current" aria-hidden="true" />
          <span className="sr-only">Stop recording</span>
        </>
      ) : (
        <>
          <Mic className="size-4" aria-hidden="true" />
          Record a voice note
        </>
      )}
    </button>
  )
}
