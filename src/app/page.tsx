import { HeroDive } from '@/components/landing/HeroDive'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { WhatIsSection } from '@/components/landing/WhatIsSection'
import { NotJustTrackerSection } from '@/components/landing/NotJustTrackerSection'
import { WidgetMosaicSection } from '@/components/landing/WidgetMosaicSection'
import { SixPillars } from '@/components/landing/SixPillars'
import { IntelligenceLayer } from '@/components/landing/IntelligenceLayer'
import { VideoStories } from '@/components/landing/VideoStories'
import { DashboardReplica } from '@/components/landing/DashboardReplica'
import { EverythingYouNeed } from '@/components/landing/EverythingYouNeed'
import { WhoItsFor } from '@/components/landing/WhoItsFor'
import { ProofAndTrust } from '@/components/landing/ProofAndTrust'
import { PriceSection } from '@/components/landing/PriceSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { FooterCurtain } from '@/components/landing/FooterCurtain'

export default function LandingPage() {
  return (
    <div className="landing-root min-h-[100dvh] bg-[var(--canvas)] overflow-x-hidden">
      <HeroDive />

      <div className="landing-page-content">
        <ProblemSection />
        <WhatIsSection />
        <NotJustTrackerSection />
        <WidgetMosaicSection />
        <SixPillars />
        <IntelligenceLayer />
        <VideoStories />
        <DashboardReplica />
        <EverythingYouNeed />
        <WhoItsFor />
        <ProofAndTrust />
        <PriceSection />
        <FAQSection />
      </div>

      <FooterCurtain />
    </div>
  )
}
