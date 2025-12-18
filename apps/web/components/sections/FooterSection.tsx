'use client'

import Image from 'next/image'
import FadeIn from '../FadeIn'
import Button from '../Button'

export default function FooterSection() {
  const currentYear = new Date().getFullYear()

  return (
    <section className="bg-black text-white py-24 lg:py-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-center mb-8 tracking-wide">
            Let's make gifting feel special again.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-xl md:text-2xl text-center leading-relaxed mb-12">
            If your products are made for moments that matter, I'd love to introduce them to the people searching for something more thoughtful than "add to cart."
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex justify-center mb-20">
            <Button href="#waitlist" variant="secondary">
              Join the Brand Waitlist
            </Button>
          </div>
        </FadeIn>

        <div className="border-t border-white/10 pt-12">
          <FadeIn delay={0.25}>
            <div className="flex justify-center mb-8">
              <Image
                src="/logo.png"
                alt="Gifter"
                width={48}
                height={48}
                className="opacity-90"
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 text-sm text-gray-400">
              <span>© Gifter {currentYear}</span>
              <a href="#" className="hover:text-white transition-colors hover:underline">
                Contact / Partnerships
              </a>
              <a href="#" className="hover:text-white transition-colors hover:underline">
                Privacy
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
