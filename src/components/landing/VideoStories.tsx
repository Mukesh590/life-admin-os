'use client'

import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'

type Story = {
  eyebrow: string
  heading: string
  copy: string
  src: string
  poster: string
}

const STORIES: Story[] = [
  {
    eyebrow: 'DOCUMENTS',
    heading: 'Capture the details once.',
    copy: 'Life AdminOS keeps the receipt, key date, amount, and warranty context together.',
    src: '/document-capture-demo-clean.mp4',
    poster: '/video-poster-documents.svg',
  },
  {
    eyebrow: 'REMINDERS',
    heading: 'See it before it becomes urgent.',
    copy: 'Upcoming bills, renewals, and deadlines stay visible through simple reminder checkpoints.',
    src: '/reminder-demo-clean.mp4',
    poster: '/video-poster-reminders.svg',
  },
  {
    eyebrow: 'ONE WORKSPACE',
    heading: 'Run the week from one clear view.',
    copy: 'The next action stays visible without turning life into another complicated project-management system.',
    src: '/device-screen-demo-clean.mp4',
    poster: '/video-poster-workspace.svg',
  },
]

const MAX_CONCURRENT_PLAYING = 2

function StoryRow({
  story,
  index,
  reduceMotion,
  registerVideo,
}: {
  story: Story
  index: number
  reduceMotion: boolean
  registerVideo: (el: HTMLVideoElement | null, index: number) => void
}) {
  const [manuallyPlaying, setManuallyPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  function handleManualPlay() {
    const video = videoRef.current
    if (!video) return
    video.src = story.src
    video.play()
    setManuallyPlaying(true)
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${index % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}>
      <div className="relative w-full rounded-2xl overflow-hidden bg-[var(--canvas-alt)]" style={{ aspectRatio: '4 / 3' }}>
        <video
          ref={(el) => {
            videoRef.current = el
            registerVideo(el, index)
          }}
          className="absolute inset-0 w-full h-full object-cover"
          poster={story.poster}
          muted
          loop
          playsInline
          preload="none"
          data-src={story.src}
          aria-label={`${story.heading} — product demo`}
        />
        {reduceMotion && !manuallyPlaying && (
          <button
            type="button"
            onClick={handleManualPlay}
            className="absolute inset-0 flex items-center justify-center group"
            aria-label={`Play demo: ${story.heading}`}
          >
            <span className="w-16 h-16 rounded-full bg-[var(--ink)]/80 group-hover:bg-[var(--ink)] transition-colors flex items-center justify-center">
              <Play className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)] mb-3">{story.eyebrow}</p>
        <h3 className="font-landing-display font-bold text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight tracking-tight text-[var(--ink)] mb-4">
          {story.heading}
        </h3>
        <p className="text-[15px] md:text-base leading-relaxed text-[var(--ink)]/70 max-w-md">{story.copy}</p>
      </div>
    </div>
  )
}

export function VideoStories() {
  const [reduceMotion, setReduceMotion] = useState(false)
  const videosRef = useRef<(HTMLVideoElement | null)[]>([])
  const playingRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reduceMotion) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement
          const index = videosRef.current.indexOf(video)
          if (index === -1) continue

          if (entry.isIntersecting && !video.src) {
            video.src = video.dataset.src || ''
          }

          if (entry.intersectionRatio >= 0.4) {
            if (playingRef.current.size < MAX_CONCURRENT_PLAYING || playingRef.current.has(index)) {
              video.play().catch(() => {})
              playingRef.current.add(index)
            }
          } else {
            video.pause()
            playingRef.current.delete(index)
          }
        }
      },
      { threshold: [0, 0.4], rootMargin: '100% 0px' }
    )

    const videos = videosRef.current.filter((v): v is HTMLVideoElement => v !== null)
    videos.forEach((v) => observer.observe(v))

    function handleVisibility() {
      if (document.hidden) {
        videos.forEach((v) => v.pause())
        playingRef.current.clear()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [reduceMotion])

  return (
    <section className="bg-[var(--canvas)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl space-y-20 md:space-y-32">
        {STORIES.map((story, i) => (
          <StoryRow
            key={story.eyebrow}
            story={story}
            index={i}
            reduceMotion={reduceMotion}
            registerVideo={(el, index) => {
              videosRef.current[index] = el
            }}
          />
        ))}
      </div>
    </section>
  )
}
