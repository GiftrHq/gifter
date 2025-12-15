'use client'

import { motion } from 'framer-motion'
import Button from '../Button'
import FadeIn from '../FadeIn'

export default function HeroSection() {
  return (
    <section className="min-h-screen bg-white text-black flex items-center">
      <div className="container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-[60%_40%] gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-display text-5xl md:text-6xl lg:text-7xl leading-tight tracking-wide"
            >
              I turn your products into unforgettable gifts.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-xl md:text-2xl leading-relaxed max-w-2xl"
            >
              Hello, I'm Gifter – your brand's future gifting concierge. I introduce your products to people who are actively hunting for <em className="italic">the</em> perfect gift for someone they love.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button href="#waitlist" variant="primary">
                Join the Brand Waitlist
              </Button>
              <Button href="#how-it-works" variant="ghost">
                See how I work with brands →
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="text-sm text-gray-600"
            >
              Early access to the merchant panel, curated placement, and launch updates – no spam, ever.
            </motion.p>
          </div>

          {/* Right Column - Video/Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden shadow-2xl"
            whileHover={{ scale: 1.01 }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover grayscale"
              poster="https://images.pexels.com/videos/6574000/pexels-photo-6574000.jpeg"
            >
              {/* Pexels video - Close-up shot of a gift box */}
              <source src="https://videos.pexels.com/video-files/6574000/6574000-hd_1080_1920_25fps.mp4" type="video/mp4" />
              {/* Fallback to alternative quality */}
              <source src="https://videos.pexels.com/video-files/6574000/6574000-hd_720_1280_25fps.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
