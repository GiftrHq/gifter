# Gifter – Prelaunch Landing Page Spec (Brands)

This file includes:

- Final **website copy** (editorial, luxury, playful AI-voice)
- **Section layout** & structure
- **UI/UX interactions & animations**
- Suggested **4K video** and **photo** sources for each area

Color scheme: **Black & White** only.  
Voice: **Gifter, the AI gifting concierge**, speaking to brands.

---

## 0. Global Design System

**Colors**

- `#000000` – Background / Primary
- `#FFFFFF` – Text on dark / Background alternation
- 10–20% gray tints allowed for borders / subtle separators only.

**Typography (example)**

- Headings: High-contrast display serif or fashion-style sans (e.g. Playfair / Cormorant / similar)
- Body: Clean geometric or neo-grotesque sans (e.g. Inter / Neue Montreal / similar)
- Tracking slightly widened for headings to feel editorial.

**Global Interactions**

- **Smooth scroll** for in-page navigation.
- **Link hover:** underline grows in from center / subtle letter-spacing.
- **Button hover:**  
  - Scale: `transform: scale(1.02)`  
  - Background invert: black → white, white → black  
  - 150–200ms ease-out.

**Scroll Animations**

- Use **fade-up** (opacity 0 → 1, translateY 20px → 0) on sections as they enter viewport.
- Duration ~400–600ms, stagger child elements by 80–120ms.
- No harsh or gimmicky effects; everything should feel calm, deliberate, expensive.

---

## 1. Hero Section

### 1.1 Layout

- **Background:** Pure white.
- **Left column (60%)**: Headline, subheadline, CTAs, microcopy.
- **Right column (40%)**:  
  - A looping **4K video** in monochrome / desaturated style (muted, auto-play, loop, no sound).  
  - Overlay a minimal UI frame mockup of “Gifter for Brands” (cards, waitlist form preview).

### 1.2 Copy

**H1:**  
**I turn your products into unforgettable gifts.**

**Subheadline:**  
Hello, I’m Gifter – your brand’s future gifting concierge. I introduce your products to people who are actively hunting for *the* perfect gift for someone they love.

**Primary CTA button:**  
> **Join the Brand Waitlist**

**Secondary CTA (ghost, text link or button):**  
> See how I work with brands →

**Microcopy under CTAs:**  
> Early access to the merchant panel, curated placement, and launch updates – no spam, ever.

### 1.3 Interactions & Animations

- **Hero text:**  
  - On load:  
    - H1 fades in from 0 → 1 opacity, slight upward motion.  
    - Subheadline and CTAs follow with a short stagger.
- **Video panel / mockup:**  
  - Slight parallax on scroll (moves slower than page).
  - On hover: add a very subtle scale (1.01) + soft box shadow.

### 1.4 Suggested 4K Videos for Hero

Use 1–2 as the hero background (desaturate if needed, keep subtle):

- Close-up gift box detail (luxury, editorial feel):  
  - <https://www.pexels.com/video/close-up-shot-of-a-gift-box-6574000/> :contentReference[oaicite:0]{index=0}  
- Hands wrapping a gift in warm, tactile lighting:  
  - <https://www.pexels.com/video/a-person-gift-wrapping-a-box-3196685/> :contentReference[oaicite:1]{index=1}  
- Close-ups of multiple presents:  
  - <https://www.pexels.com/video/close-up-video-of-presents-7763519/> :contentReference[oaicite:2]{index=2}  

---

## 2. “What Am I?” Strip

### 2.1 Layout

- Full-width **black background**.
- Centered content, max-width container.
- One title, one paragraph, then three short value props displayed horizontally on desktop, stacked on mobile.

### 2.2 Copy

**Title:**  
What am I, exactly?

**Body text:**  
I’m not a marketplace wall of products. I’m the intelligent, taste-led layer that sits between “I need a gift” and “I’ve just found the perfect one.” When someone arrives with a person, an occasion, and a budget, I match them with brands like yours.

**Value props:**

- I bring you high-intent gifters  
- I simplify choice into curation  
- I champion thoughtful, distinctive brands

### 2.3 Interactions & Animations

- Section fades in as a block; then each value prop **slides up** slightly with stagger.
- Value props on hover: subtle underline + 2px vertical lift.

### 2.4 Visuals

- No photo required; let this be a **pure typography** section for contrast.
- Optional: a very soft, low-opacity black-on-black gradient or geometric pattern background (still effectively “black”).

---

## 3. Problem Section – “Right now, gifting is guesswork”

### 3.1 Layout

- Background: **white**.
- Two-column layout:
  - Left: headline + descriptive copy.
  - Right: 3 “problem cards” with short sharp points.

### 3.2 Copy

**Title:**  
Right now, gifting is guesswork.

**Body text:**  
Gifting lives in too many places: giant marketplaces, saved screenshots, half-finished wishlists, late-night panic scrolls. Shoppers feel overwhelmed. Brands feel invisible.

**Problem cards (right column):**

1. **You’re lost in the grid**  
   Your products compete with thousands of near-identical listings in the same cold, endless feed.

2. **Rising ad spend, shrinking signal**  
   Getting seen often means paying more to shout louder, not telling your story better.

3. **Defaulting to “that same thing”**  
   When the choice feels too heavy, shoppers fall back to gift cards and safe repeats. Your best work never even enters the conversation.

**Closing line (under columns):**  
That’s the gap I’m here to close.

### 3.3 Interactions & Animations

- As section enters viewport:
  - Left column fades in first.
  - Cards slide in from the right with a small delay between each.
- On hover, each card:
  - Gains a 1px black border and a very light gray background (#f7f7f7).

### 3.4 Visuals

- Optional side photo in right column behind or above cards:
  - Minimal, black and white studio shot of objects / packaging.  
  - Source examples:  
    - Minimal black & white collection: <https://unsplash.com/collections/2737036/minimal-black-and-white-> :contentReference[oaicite:3]{index=3}  
    - Minimalist black and white photos: <https://unsplash.com/s/photos/minimal-black-and-white> :contentReference[oaicite:4]{index=4}  

Designer: choose a 4K+ resolution image, crop to maintain clean negative space.

---

## 4. Solution Section – “I place your products inside the moments that matter”

### 4.1 Layout

- Background: **black**.
- White text.
- Intro copy at top, then a **2x2 grid of cards**.

### 4.2 Copy

**Title:**  
I place your products inside the moments that matter.

**Intro paragraph:**  
When someone tells me, *“I need something for my best friend who loves ritual, design, and slow mornings”*, I don’t show them everything. I show them a small, beautifully considered selection—and that’s where your products step in.

**Cards:**

1. **Context, not chaos**  
   I only recommend your products when they genuinely fit the person, the mood, and the occasion. No random placements. Just relevance.

2. **Curated stories, not just SKUs**  
   I frame your catalogue as gift stories: “for the quiet ritualist,” “for the minimalist aesthete,” “for the host who has everything.”

3. **Social by design**  
   I help people save, share, and group-gift your products across birthdays, holidays, and milestones—extending your reach beyond a single shopper.

4. **Occasion-led demand**  
   I remember the dates that matter. When they’re approaching, I bring people back to discover gifts again—often right where they left off, with brands they loved.

### 4.3 Interactions & Animations

- Cards appear with a **staggered fade-up** (top left → top right → bottom left → bottom right).
- On hover:
  - Card background remains black; add a **white 1px border** and slight inner glow.  
  - Text moves upward by 1–2px.

### 4.4 Visuals

- Keep cards mostly typographic.
- Optional faint line-art icons (outline-only) if desired—no color.

---

## 5. “How We’ll Work Together” – Future Merchant Panel Flow

### 5.1 Layout

- Background: **white**.
- Three steps horizontally on desktop; stacked with numbers on mobile.

### 5.2 Copy

**Title:**  
How we’ll work together

**Intro:**  
When my merchant panel opens, joining me will feel less like integrating with a tool, and more like onboarding a very committed gifting assistant.

**Step 1 – Introduce yourself**  
Create your brand profile, add or connect your products, and tell me who they’re perfect for. No heavy setup. Just your story and your catalogue.

**Step 2 – I learn your “gift fit”**  
I organise your products around people and occasions: the design lover, the coffee obsessive, the new parent, the host, the colleague. I learn where you shine most.

**Step 3 – I bring you ready-to-buy gifters**  
When someone comes to me with a real person in mind, I know when your product is the right answer. You receive orders from customers who discovered you in their search for “that’s so them.”

**Subline (below steps):**  
Join the waitlist now to be among the first brands I onboard.

**CTA (centered):**  
> Join the Brand Waitlist

### 5.3 Interactions & Animations

- Each step has a **large outlined number** behind the text (e.g. “01”, “02”, “03”).
- On hover:
  - Number slightly grows and becomes more opaque.
- On scroll:
  - Steps animate with a **left-to-right reveal line** (small horizontal rule animates from 0% → 100% width under the step title).

### 5.4 Visuals

- Optional side-by-side **mockup of merchant panel**: simple monochrome UI frame showing:
  - Brand profile card
  - Product cards tagged with personas (“Coffee Lover”, “Design Minimalist”)

---

## 6. Benefits for Brands – “Why join me as an early partner?”

### 6.1 Layout

- Background: **black**.
- Two-column layout:
  - Left: Section title & intro.
  - Right: 6 bullet-style “benefit tiles,” grouped in two columns.

### 6.2 Copy

**Title:**  
Why join me as an early partner?

**Benefits:**

- **New customers, the right context**  
  I introduce your brand when someone is emotionally invested in getting it right—not passively browsing.

- **Less shouting, more curation**  
  You don’t need the biggest budget to be seen. You need the best fit. I optimise for that.

- **Designed around gifting, not generic commerce**  
  Birthdays, anniversaries, holidays, “just because” moments—my entire ecosystem is tuned to these occasions.

- **Higher intent, fewer distractions**  
  By the time someone sees your product, they’ve already told me who they’re gifting for and what they care about.

- **A home for thoughtful brands**  
  I’m built for brands with a point of view: quality, craft, design, ritual, story.

- **Founding partner advantages**  
  Early brands help shape features, appear in launch collections, and benefit from my earliest marketing pushes.

### 6.3 Interactions & Animations

- Each benefit tile:
  - On hover: subtle underline on heading, plus micro-movement upward.
- Optionally add **micro-interaction**: when user scrolls here, a small label appears at top right “For brands like yours” fading in.

### 6.4 Visuals

- Keep it text-dominant.
- Optional background 4K loop (very subtle, ultra-dark abstract texture) behind black overlay:

  - Black & white luxury background video collection:  
    - <https://www.pexels.com/search/videos/black%20and%20white%20luxury%20background/> :contentReference[oaicite:5]{index=5}  

  Apply a heavy dark overlay to keep everything readable.

---

## 7. “Who Belongs Inside Gifter?”

### 7.1 Layout

- Background: **white**.
- Title + short paragraph + list of categories.
- Underneath: horizontal **brand archetype pills**.

### 7.2 Copy

**Title:**  
Who belongs inside Gifter?

**Body text:**  
If your products are made to be *chosen*—not simply added to cart—then we’ll get along very well.

**Examples list:**

- Design-led homeware and lifestyle brands  
- Specialty coffee, tea, chocolate, wine & craft producers  
- Fashion and accessories with a distinct aesthetic  
- Beauty, wellness, and ritual-driven products  
- Stationery, objects, and desktop companions  
- Concept stores, boutiques, and curated multi-brand spaces

**Subline:**  
If people say “this is so them” when they buy from you, I’m building this platform with you in mind.

### 7.3 Interactions & Animations

- Category pills (optional):
  - Hover: inverted colors (black background, white text).
  - Click: smooth scroll to waitlist form.

### 7.4 Visuals

- Consider a **horizontal strip of product-esque imagery** (collage of monochrome shots):

  - Minimalist black images: <https://unsplash.com/s/photos/minimalist-black> :contentReference[oaicite:6]{index=6}  
  - Studio images (for product, objects, setups): <https://unsplash.com/s/photos/studio> :contentReference[oaicite:7]{index=7}  

Pick 3–4 images that feel like different brand archetypes and place them side-by-side or in a subtle collage.

---

## 8. “Be part of my first chapter” – Waitlist Value

### 8.1 Layout

- Background: **black**.
- Centered text & form.
- This is your primary **conversion block**.

### 8.2 Copy

**Title:**  
Be part of my first chapter.

**Body text:**  
The first brands inside Gifter will help set the tone for how gifting should feel: personal, modern, and beautifully curated.

**List:**  
By joining the waitlist, you’ll:

- Be first in line when the merchant panel goes live.  
- Receive a personal invite to onboarding and walkthroughs.  
- Be considered for my earliest curated gift collections.  
- Have a direct line to influence brand-facing features.  
- Join a small, handpicked circle of founding partner brands.

**Form fields:**

- Input: *Work email*  
- Input (optional): *Brand name*  
- Button: **Join the Brand Waitlist**

**Microcopy under button:**  
> I’ll only email when I have something genuinely useful to share.

### 8.3 Interactions & Animations

- Button:
  - Hover: invert colors (white background, black text) + slight scale.
- On form submit:
  - Button animates to a loading state (spinner + “Adding you to the list…”).  
  - Then success state:  
    - Headline swaps to: “You’re on the list.”  
    - Subcopy: “I’ll be in touch when it’s time to introduce your brand properly.”

### 8.4 Visuals / Background Video

Optional subtle background loop (darkened heavily, blurred if needed):

- Close-up of gift wrapping in slow motion:  
  - <https://www.pexels.com/video/person-wrapping-a-gift-6651198/> :contentReference[oaicite:8]{index=8}  
- Gift box packaging / hands, very textural:  
  - <https://www.pexels.com/search/videos/gift%20box%20packaging/> :contentReference[oaicite:9]{index=9}  

---

## 9. FAQ – “You might be wondering…”

### 9.1 Layout

- Background: **white**.
- Accordion or simple stacked Q&A list.

### 9.2 Copy

**Title:**  
You might be wondering…

**Q1: What will it cost to work with you?**  
During early access, there’s no obligation. Before you go live, I’ll share clear pricing and commission details so you can decide if it fits your business.

**Q2: Do I need to change my existing ecommerce setup?**  
No. You keep your current setup. You’ll simply upload products or connect your store (where supported), and I’ll handle the discovery layer.

**Q3: Who handles shipping and fulfilment?**  
You do. I bring you the customer and the order details; you fulfil in your usual way, with your packaging, your timing, your standards.

**Q4: Will every brand on the waitlist be accepted?**  
I’m curating my first group of partners to ensure a strong fit with gifting and a high-quality experience. The waitlist is your way of stepping to the front when places open.

**Q5: I’m a small or emerging brand. Is this still for me?**  
Absolutely. You’re exactly who I want to help surface: independent, thoughtful, story-rich brands that deserve to be discovered.

### 9.3 Interactions & Animations

- Accordion-style Q&A:
  - Click on a question → smooth expand/collapse with 200–300ms animation.
  - Chevron icon rotates 0–90°.
- Optional: auto-scroll the active question to top of viewport on mobile.

---

## 10. Final CTA + Footer

### 10.1 Layout

- Background: **black**.
- Centered headline, then secondary CTA, then minimalist footer.

### 10.2 Copy

**Headline:**  
Let’s make gifting feel special again.

**Body:**  
If your products are made for moments that matter, I’d love to introduce them to the people searching for something more thoughtful than “add to cart.”

**CTA button:**  
> Join the Brand Waitlist

**Footer (below a thin line):**

- © Gifter (Year)  
- Contact / Partnerships  
- Privacy  

### 10.3 Interactions

- Final CTA scrolls back to the primary waitlist form section (anchor link).
- Footer links: simple underline on hover.

---

## 11. Asset Summary (Quick Reference)

**Hero video options (4K+):**

- Close-up of gift box – editorial look  
  - <https://www.pexels.com/video/close-up-shot-of-a-gift-box-6574000/> :contentReference[oaicite:10]{index=10}  
- Hands wrapping a gift (slow, crafted)  
  - <https://www.pexels.com/video/a-person-gift-wrapping-a-box-3196685/> :contentReference[oaicite:11]{index=11}  

**Section background / B-roll loops (4K+):**

- Gift wrapping in detail:  
  - <https://www.pexels.com/video/person-wrapping-a-gift-6651198/> :contentReference[oaicite:12]{index=12}  
- Close-up video of presents:  
  - <https://www.pexels.com/video/close-up-video-of-presents-7763519/> :contentReference[oaicite:13]{index=13}  
- Black & white luxury background loops (choose 4K clips):  
  - <https://www.pexels.com/search/videos/black%20and%20white%20luxury%20background/> :contentReference[oaicite:14]{index=14}  

**Photo pools (pick 4K or higher):**

- Minimal black & white editorial imagery:  
  - <https://unsplash.com/s/photos/minimal-black-and-white> :contentReference[oaicite:15]{index=15}  
- Minimalist black images (dark, moody product / texture shots):  
  - <https://unsplash.com/s/photos/minimalist-black> :contentReference[oaicite:16]{index=16}  
- Studio photography for objects / product staging:  
  - <https://unsplash.com/s/photos/studio> :contentReference[oaicite:17]{index=17}  

Designers/devs: for each section, choose **one hero visual** and keep everything else very restrained. The copy and black/white typography should carry most of the weight.

---
