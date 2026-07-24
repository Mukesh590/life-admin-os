import { HeroDive } from '@/components/landing/HeroDive'
import { StatsBand } from '@/components/landing/StatsBand'
import { Marquee } from '@/components/landing/Marquee'
import { DashboardReplica } from '@/components/landing/DashboardReplica'
import { VideoStories } from '@/components/landing/VideoStories'
import { FounderSection } from '@/components/landing/FounderSection'
import { ClosingCTA } from '@/components/landing/ClosingCTA'
import { FooterCurtain } from '@/components/landing/FooterCurtain'

export default function LandingPage() {
  return (
    <div className="landing-root min-h-[100dvh] bg-[var(--canvas)] overflow-x-hidden">
      <HeroDive />

      <div className="landing-page-content">
        <StatsBand />
        <Marquee />
        <DashboardReplica />
        <VideoStories />
        <FounderSection />
        <ClosingCTA />
      </div>

      <FooterCurtain />
    </div>
  )
}
