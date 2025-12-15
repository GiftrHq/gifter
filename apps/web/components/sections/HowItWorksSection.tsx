'use client'

import FadeIn from '../FadeIn'
import Button from '../Button'

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Introduce yourself",
      description: "Create your brand profile, add or connect your products, and tell me who they're perfect for. No heavy setup. Just your story and your catalogue."
    },
    {
      number: "02",
      title: "I learn your \"gift fit\"",
      description: "I organise your products around people and occasions: the design lover, the coffee obsessive, the new parent, the host, the colleague. I learn where you shine most."
    },
    {
      number: "03",
      title: "I bring you ready-to-buy gifters",
      description: "When someone comes to me with a real person in mind, I know when your product is the right answer. You receive orders from customers who discovered you in their search for \"that's so them.\""
    }
  ]

  return (
    <section className="bg-white text-black py-24 lg:py-32">
      <div className="container mx-auto px-6 max-w-6xl">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-center mb-8 tracking-wide">
            How we'll work together
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-xl text-center leading-relaxed mb-16 max-w-3xl mx-auto">
            When my merchant panel opens, joining me will feel less like integrating with a tool, and more like onboarding a very committed gifting assistant.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {steps.map((step, index) => (
            <FadeIn key={index} delay={0.2 + index * 0.1}>
              <div className="relative group">
                <div className="text-8xl font-display opacity-10 group-hover:opacity-20 transition-opacity duration-300 mb-4">
                  {step.number}
                </div>
                <div className="w-16 h-0.5 bg-black mb-6 transition-all duration-500 group-hover:w-full" />
                <h3 className="font-display text-2xl mb-4 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5}>
          <p className="text-center text-lg mb-8">
            Join the waitlist now to be among the first brands I onboard.
          </p>
        </FadeIn>

        <FadeIn delay={0.6}>
          <div className="flex justify-center">
            <Button href="#waitlist" variant="primary">
              Join the Brand Waitlist
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
