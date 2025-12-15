'use client'

import FadeIn from '../FadeIn'

export default function SolutionSection() {
  const cards = [
    {
      title: "Context, not chaos",
      description: "I only recommend your products when they genuinely fit the person, the mood, and the occasion. No random placements. Just relevance."
    },
    {
      title: "Curated stories, not just SKUs",
      description: "I frame your catalogue as gift stories: \"for the quiet ritualist,\" \"for the minimalist aesthete,\" \"for the host who has everything.\""
    },
    {
      title: "Social by design",
      description: "I help people save, share, and group-gift your products across birthdays, holidays, and milestones—extending your reach beyond a single shopper."
    },
    {
      title: "Occasion-led demand",
      description: "I remember the dates that matter. When they're approaching, I bring people back to discover gifts again—often right where they left off, with brands they loved."
    }
  ]

  return (
    <section id="how-it-works" className="bg-black text-white py-24 lg:py-32">
      <div className="container mx-auto px-6 max-w-6xl">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-center mb-8 tracking-wide">
            I place your products inside the moments that matter.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-xl md:text-2xl text-center leading-relaxed mb-16 max-w-4xl mx-auto">
            When someone tells me, <em className="italic">"I need something for my best friend who loves ritual, design, and slow mornings"</em>, I don't show them everything. I show them a small, beautifully considered selection—and that's where your products step in.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {cards.map((card, index) => (
            <FadeIn key={index} delay={0.2 + index * 0.1}>
              <div className="p-8 border border-white/10 hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 group">
                <h3 className="font-display text-2xl mb-4 tracking-wide transition-transform duration-200 group-hover:-translate-y-0.5">
                  {card.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
