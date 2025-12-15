'use client'

import FadeIn from '../FadeIn'

export default function ProblemSection() {
  const problems = [
    {
      title: "You're lost in the grid",
      description: "Your products compete with thousands of near-identical listings in the same cold, endless feed."
    },
    {
      title: "Rising ad spend, shrinking signal",
      description: "Getting seen often means paying more to shout louder, not telling your story better."
    },
    {
      title: "Defaulting to \"that same thing\"",
      description: "When the choice feels too heavy, shoppers fall back to gift cards and safe repeats. Your best work never even enters the conversation."
    }
  ]

  return (
    <section className="bg-white text-black py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
          {/* Left Column */}
          <FadeIn>
            <div className="space-y-6">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight tracking-wide">
                Right now, gifting is guesswork.
              </h2>
              <p className="text-xl leading-relaxed">
                Gifting lives in too many places: giant marketplaces, saved screenshots, half-finished wishlists, late-night panic scrolls. Shoppers feel overwhelmed. Brands feel invisible.
              </p>
            </div>
          </FadeIn>

          {/* Right Column - Problem Cards */}
          <div className="space-y-6">
            {problems.map((problem, index) => (
              <FadeIn key={index} delay={0.1 + index * 0.1}>
                <div className="p-6 border border-transparent hover:border-black hover:bg-gray-50 transition-all duration-300 group">
                  <h3 className="font-display text-2xl mb-3 tracking-wide">
                    {problem.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        <FadeIn delay={0.4}>
          <p className="text-2xl md:text-3xl font-display text-center mt-16 tracking-wide">
            That's the gap I'm here to close.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
