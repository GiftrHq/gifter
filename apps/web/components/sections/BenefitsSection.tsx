'use client'

import FadeIn from '../FadeIn'

export default function BenefitsSection() {
  const benefits = [
    {
      title: "New customers, the right context",
      description: "I introduce your brand when someone is emotionally invested in getting it right—not passively browsing."
    },
    {
      title: "Less shouting, more curation",
      description: "You don't need the biggest budget to be seen. You need the best fit. I optimise for that."
    },
    {
      title: "Designed around gifting, not generic commerce",
      description: "Birthdays, anniversaries, holidays, \"just because\" moments—my entire ecosystem is tuned to these occasions."
    },
    {
      title: "Higher intent, fewer distractions",
      description: "By the time someone sees your product, they've already told me who they're gifting for and what they care about."
    },
    {
      title: "A home for thoughtful brands",
      description: "I'm built for brands with a point of view: quality, craft, design, ritual, story."
    },
    {
      title: "Founding partner advantages",
      description: "Early brands help shape features, appear in launch collections, and benefit from my earliest marketing pushes."
    }
  ]

  return (
    <section className="bg-black text-white py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-[40%_60%] gap-12 lg:gap-16">
          {/* Left Column */}
          <FadeIn>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight tracking-wide sticky top-32">
              Why join me as an early partner?
            </h2>
          </FadeIn>

          {/* Right Column - Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <FadeIn key={index} delay={0.1 + (index * 0.05)}>
                <div className="p-6 group cursor-default hover:bg-white/5 transition-all duration-300">
                  <h3 className="font-display text-xl mb-3 tracking-wide group-hover:-translate-y-0.5 transition-transform duration-200 group-hover:underline underline-offset-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
