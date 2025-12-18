'use client'

import { useState } from 'react'
import FadeIn from '../FadeIn'
import Button from '../Button'

export default function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [brandName, setBrandName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          brandName: brandName || undefined,
          //type: 'brand', // optional: if your API supports this field
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // if you decide to return specific status codes (e.g. 409), you can handle them here
        // if (response.status === 409) {
        //   setSubmitted(true)
        //   return
        // }

        throw new Error(data.error || 'Failed to sign up')
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error('Waitlist signup error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    "Be first in line when the merchant panel goes live.",
    "Receive a personal invite to onboarding and walkthroughs.",
    "Be considered for my earliest curated gift collections.",
    "Have a direct line to influence brand-facing features.",
    "Join a small, handpicked circle of founding partner brands."
  ]

  if (submitted) {
    return (
      <section id="waitlist" className="bg-black text-white py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover grayscale blur-sm"
          >
            <source src="https://static.pexels.com/lib/videos/free-videos.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="container mx-auto px-6 max-w-3xl relative z-10">
          <FadeIn>
            <div className="text-center space-y-6">
              <h2 className="font-display text-5xl md:text-6xl tracking-wide">
                You're on the list.
              </h2>
              <p className="text-xl md:text-2xl text-gray-300">
                I'll be in touch when it's time to introduce your brand properly.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    )
  }

  return (
    <section id="waitlist" className="bg-black text-white py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover grayscale blur-sm"
        >
          <source src="https://static.pexels.com/lib/videos/free-videos.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-center mb-8 tracking-wide">
            Be part of my first chapter.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-xl md:text-2xl text-center leading-relaxed mb-12">
            The first brands inside Gifter will help set the tone for how gifting should feel: personal, modern, and beautifully curated.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mb-12">
            <p className="text-lg mb-6">By joining the waitlist, you'll:</p>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-3 mt-1">—</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            {error && (
              <div className="px-6 py-4 bg-red-500/10 border-2 border-red-500/50 text-red-200">
                {error}
              </div>
            )}
            <div>
              <input
                type="email"
                required
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-6 py-4 bg-white text-black border-2 border-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Brand name (optional)"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={loading}
                className="w-full px-6 py-4 bg-transparent text-white border-2 border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder:text-gray-400 disabled:opacity-50"
              />
            </div>
            <Button variant="secondary" className="w-full" disabled={loading}>
              {loading ? 'Joining...' : 'Join the Brand Waitlist'}
            </Button>
            <p className="text-sm text-gray-400 text-center">
              I'll only email when I have something genuinely useful to share.
            </p>
          </form>
        </FadeIn>
      </div>
    </section>
  )
}
