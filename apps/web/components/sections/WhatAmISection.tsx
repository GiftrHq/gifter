'use client'

import FadeIn from '../FadeIn'

export default function WhatAmISection() {
  const valueProps = [
    "I bring you high-intent gifters",
    "I simplify choice into curation",
    "I champion thoughtful, distinctive brands"
  ]

  return (
    <section className="bg-black text-white py-24 lg:py-32">
      <div className="container mx-auto px-6 max-w-5xl">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl text-center mb-8 tracking-wide">
            What am I, exactly?
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-xl md:text-2xl text-center leading-relaxed mb-12 max-w-4xl mx-auto">
            I'm not a marketplace wall of products. I'm the intelligent, taste-led layer that sits between "I need a gift" and "I've just found the perfect one." When someone arrives with a person, an occasion, and a budget, I match them with brands like yours.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {valueProps.map((prop, index) => (
            <FadeIn key={index} delay={0.2 + index * 0.1}>
              <div className="text-center group cursor-default">
                <p className="text-lg font-medium transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:underline underline-offset-4">
                  {prop}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
