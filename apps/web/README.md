# Gifter - Brand Prelaunch Website

A sophisticated, luxury prelaunch landing page for Gifter's brand waitlist built with Next.js, TypeScript, Tailwind CSS v4, and Framer Motion.

## Design System

- **Colors**: Pure black (#000000) and white (#ffffff) only
- **Typography**:
  - Display/Headings: Playfair Display (serif)
  - Body: Inter (sans-serif)
- **Animations**: Smooth scroll, fade-up effects, hover interactions

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** with CSS-first configuration
- **Framer Motion** for animations
- **React 19** latest

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
website/prelaunch/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main page assembling all sections
│   └── globals.css         # Global styles and Tailwind config
├── components/
│   ├── Button.tsx          # Reusable button component
│   ├── FadeIn.tsx          # Scroll animation wrapper
│   └── sections/
│       ├── HeroSection.tsx
│       ├── WhatAmISection.tsx
│       ├── ProblemSection.tsx
│       ├── SolutionSection.tsx
│       ├── HowItWorksSection.tsx
│       ├── BenefitsSection.tsx
│       ├── WhoBelongsSection.tsx
│       ├── WaitlistSection.tsx
│       ├── FAQSection.tsx
│       └── FooterSection.tsx
└── next.config.js          # Next.js configuration
```

## Features

### Implemented Sections

1. **Hero Section** - Main headline with video background
2. **What Am I?** - Introduction and value propositions
3. **Problem Section** - Three key problems brands face
4. **Solution Section** - 2x2 grid of how Gifter solves these
5. **How We'll Work Together** - Three-step process
6. **Benefits for Brands** - Six key benefits
7. **Who Belongs** - Target brand categories
8. **Waitlist Form** - Email capture with success state
9. **FAQ** - Accordion-style Q&A
10. **Footer** - Final CTA and links

### Interactions & Animations

- Smooth scroll navigation
- Fade-up animations on scroll
- Hover effects on buttons (scale + color invert)
- Accordion FAQ section
- Form submission state management

## Form Integration

The waitlist form is set up with state management but not connected to a backend yet. To integrate:

1. Add your form submission endpoint in `components/sections/WaitlistSection.tsx`
2. Update the `handleSubmit` function to post to your API
3. Add error handling as needed

## Customization

### Colors

Edit `app/globals.css` theme section:

```css
@theme {
  --color-black: #000000;
  --color-white: #ffffff;
}
```

### Typography

Fonts are configured in `app/layout.tsx` using Next.js font optimization.

### Content

All copy is based on `brand/website-prelaunch-copy.md`. Update section components in `components/sections/` to modify content.

## Production Deployment

This site is production-ready and can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- Any Node.js hosting platform

### Environment Variables

No environment variables required for the static site. Add as needed when integrating the form backend.

## License

Private - All rights reserved
