'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FadeIn from '../FadeIn'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "What will it cost to work with you?",
      answer: "During early access, there's no obligation. Before you go live, I'll share clear pricing and commission details so you can decide if it fits your business."
    },
    {
      question: "Do I need to change my existing ecommerce setup?",
      answer: "No. You keep your current setup. You'll simply upload products or connect your store (where supported), and I'll handle the discovery layer."
    },
    {
      question: "Who handles shipping and fulfilment?",
      answer: "You do. I bring you the customer and the order details; you fulfil in your usual way, with your packaging, your timing, your standards."
    },
    {
      question: "Will every brand on the waitlist be accepted?",
      answer: "I'm curating my first group of partners to ensure a strong fit with gifting and a high-quality experience. The waitlist is your way of stepping to the front when places open."
    },
    {
      question: "I'm a small or emerging brand. Is this still for me?",
      answer: "Absolutely. You're exactly who I want to help surface: independent, thoughtful, story-rich brands that deserve to be discovered."
    }
  ]

  return (
    <section className="bg-white text-black py-24 lg:py-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-center mb-16 tracking-wide">
            You might be wondering…
          </h2>
        </FadeIn>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={0.1 + index * 0.05}>
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full py-6 flex justify-between items-center text-left hover:opacity-70 transition-opacity"
                >
                  <span className="font-display text-xl md:text-2xl tracking-wide pr-8">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openIndex === index ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-3xl flex-shrink-0"
                  >
                    →
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-lg text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
