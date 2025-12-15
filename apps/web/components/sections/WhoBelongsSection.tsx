'use client'

import FadeIn from '../FadeIn'

export default function WhoBelongsSection() {
  const categories = [
    "Design-led homeware and lifestyle brands",
    "Specialty coffee, tea, chocolate, wine & craft producers",
    "Fashion and accessories with a distinct aesthetic",
    "Beauty, wellness, and ritual-driven products",
    "Stationery, objects, and desktop companions",
    "Concept stores, boutiques, and curated multi-brand spaces"
  ]

  return (
    <section className="bg-white text-black py-24 lg:py-32">
      <div className="container mx-auto px-6 max-w-5xl">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-center mb-8 tracking-wide">
            Who belongs inside Gifter?
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-xl md:text-2xl text-center leading-relaxed mb-12 max-w-3xl mx-auto">
            If your products are made to be <em className="italic">chosen</em>—not simply added to cart—then we'll get along very well.
          </p>
        </FadeIn>

        <div className="space-y-4 mb-12 max-w-3xl mx-auto">
          {categories.map((category, index) => (
            <FadeIn key={index} delay={0.2 + index * 0.05}>
              <div className="text-lg leading-relaxed pl-6 border-l-2 border-black py-2">
                {category}
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.6}>
          <p className="text-xl md:text-2xl font-display text-center tracking-wide max-w-3xl mx-auto">
            If people say "this is so them" when they buy from you, I'm building this platform with you in mind.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
