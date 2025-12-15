'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  onClick?: () => void
  href?: string
  className?: string
}

export default function Button({
  children,
  variant = 'primary',
  onClick,
  href,
  className = ''
}: ButtonProps) {
  const baseStyles = "px-8 py-4 text-base font-medium transition-all duration-200 ease-out"

  const variantStyles = {
    primary: "bg-black text-white border-2 border-black hover:bg-white hover:text-black hover:border-black hover:scale-[1.02]",
    secondary: "bg-white text-black border-2 border-white hover:bg-black hover:text-white hover:border-white hover:scale-[1.02]",
    ghost: "bg-transparent text-black border-2 border-black hover:bg-black hover:text-white hover:border-white hover:scale-[1.02]"
  }

  const Component = motion.button

  if (href) {
    return (
      <motion.a
        href={href}
        className={`${baseStyles} ${variantStyles[variant]} ${className} inline-block text-center`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <Component
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </Component>
  )
}
