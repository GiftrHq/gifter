import HeroSection from '@/components/sections/HeroSection'
import WhatAmISection from '@/components/sections/WhatAmISection'
import ProblemSection from '@/components/sections/ProblemSection'
import SolutionSection from '@/components/sections/SolutionSection'
import HowItWorksSection from '@/components/sections/HowItWorksSection'
import BenefitsSection from '@/components/sections/BenefitsSection'
import WhoBelongsSection from '@/components/sections/WhoBelongsSection'
import WaitlistSection from '@/components/sections/WaitlistSection'
import FAQSection from '@/components/sections/FAQSection'
import FooterSection from '@/components/sections/FooterSection'

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <WhatAmISection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <BenefitsSection />
      <WhoBelongsSection />
      <WaitlistSection />
      <FAQSection />
      <FooterSection />
    </main>
  )
}
