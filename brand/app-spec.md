# Gifter – iOS Consumer App Spec  

*(Copy, Layout, UI/UX, Interactions, Animations, Routing)*

Based on the **prelaunch website spec**: black & white, luxury editorial aesthetic, and Gifter as a calm, playful **AI gifting concierge**. :contentReference[oaicite:0]{index=0}  

---

## 0. Global App Design System

### 0.1 Color

- `GifterBlack` – `#000000` (primary background)
- `GifterOffBlack` – `#050505`–`#0A0A0A` (cards, sheets)
- `GifterWhite` – `#FFFFFF` (primary text on dark, key surfaces)
- `GifterGray` – `#8A8A8A` (secondary text)
- `GifterSoftGray` – `#151515` (borders, separators, muted states)

No accent colors. Contrast + photography carry the brand.

### 0.2 Typography

- **Headings** – high-contrast editorial serif / fashion sans  
  - `DisplayXL` – 32–36pt, slightly expanded tracking.  
  - `DisplayL` – 24–28pt.  
- **Body** – clean sans (Inter / SF)  
  - `Body` – 15–17pt.  
  - `Caption` – 12–13pt, uppercase for labels.

### 0.3 Components

- **Primary Button**
  - Background: white
  - Text: black, medium weight
  - Height: 48, radius: 12
  - Interaction: scale to 1.03 on press, 200ms ease-out, light haptic.

- **Secondary Button**
  - Transparent background
  - 1px white border, white text
  - Same size & radius
  - On press: border + text fade to 80% opacity then back.

- **Card**
  - Background: `GifterOffBlack`
  - Radius: 16–20
  - Border: 1px `GifterSoftGray`
  - Shadow: extremely soft
  - On tap: scale to 0.98, haptic.

- **Pill / Chip**
  - Capsule shape
  - Filled (white on black) or outlined (white border, transparent).

### 0.4 Motion Principles

- Motion is **calm, deliberate, expensive**:
  - Durations: 0.2–0.35s
  - Curves: ease-out / spring with low damping (no bounce)
- Entering content:
  - Fade in + 8–12pt upward translation (similar to landing page fade-up).
- Carousels:
  - Items slide in from the side with small stagger.
- Loading:
  - Dark skeleton cards with white shimmer.

---

## 1. App Shell & Routing

### 1.1 Top-Level Structure

- Root: `AppView`
  - If not authenticated → `AuthFlow`
  - If authenticated, first-run and profile incomplete → `OnboardingFlow`
  - Else → `MainTabView`

### 1.2 Tabs (Bottom Tab Bar)

1. **Home**  
   Icon: house-like outline (white SF Symbol).
2. **Find** (Find Someone a Gift)  
   Icon: person with sparkles / magnifying glass.
3. **Occasions**  
   Icon: calendar.
4. **You** (Profile & settings)  
   Icon: person.circle.

Each tab has its own `NavigationStack`.

---

## 2. Launch & Authentication

### 2.1 Launch / Splash

**View:** `SplashView`

- Background: black.
- Center: white **bow logo**.
- Below: tiny caption (fade in after 0.6s):

  > “Thinking of the perfect gift…”

- Animation:
  - Bow “breathes”: scale 1.0 → 1.05 → 1.0, 1.2s loop until app ready.
  - Fade to next view with crossfade.

### 2.2 Welcome (Unauthenticated)

**View:** `WelcomeView`

**Layout**

- Top: centered bow mark + “Gifter” wordmark.
- Middle: large heading + subtext.
- Bottom: buttons.

**Copy**

Title:  
> **Hello, I’m Gifter.**

Body:  
> I help you find gifts that feel *exactly* like them — not just “that’ll do.”

Buttons:

- Primary: **Sign up**
- Secondary (text): **Log in**

Footnote:  
> “You’ll be able to save wishlists, remember occasions, and pick up where you left off.”

**Interactions**

- On appear: title → body → buttons fade up sequentially.
- Tapping Sign up/Log in pushes respective forms.

### 2.3 Sign Up / Log In

**Views:** `SignupView`, `LoginView`

Fields:

- Email
- Password (min length hint)

Copy lines:

- Title (signup):  
  > **Let’s get you set up.**
- Subtitle:  
  > “Just an email and a password — I’ll handle remembering the rest.”

Errors:

- Inline, concise:  
  > “That didn’t work. Check your details and try again.”

On success:

- Call `appState.initializeAfterAuth()`
- Route → `OnboardingIntroView`.

---

## 3. Onboarding & Taste Profile

### 3.1 Onboarding Intro

**View:** `OnboardingIntroView` (full-screen cover)

Copy:

Title:  
> **Let me learn your taste.**

Body:  
> I’ll ask a few quick questions about you and the people you buy for. The better I know you, the better I gift.

Buttons:

- Primary: **Start**
- Secondary: **Skip for now** (smaller, text-only).

Animation:

- Progress indicator: simple “Step 1 of 3” below title.

### 3.2 Taste Profile Flow – User (Deep Mode)

**View:** `TasteProfileView(mode: .userDeep)`

Pattern:

- One question per screen.
- Centered card with:
  - Question title.
  - Optional short line: “Choose one that feels closest.”
  - Answer options as **large pills** or **cards**.

Navigation:

- Answer → immediately animates to next:
  - Current card slides left + fades.
  - Next card slides in from right.

Example Questions & Copy:

**Q1**  
Title:  
> **How would you describe your everyday style?**

Options:

- “Minimal & clean”
- “Cozy & soft”
- “Bold & playful”
- “Eclectic, a bit of everything”
- “I’d rather you decide”

Hint (small, under options):  
> “No pressure — you can always change this later.”

**Q2**  
Title:  
> **Which of these feels most like a perfect evening?**

Options:

- “Hosting friends at home”
- “A quiet night in with a book”
- “Trying a new restaurant”
- “Out late, loud music, full energy”

…

Final screen:

Title:  
> **Got it. I’m on your wavelength.**

Body:  
> I’ll use this anytime you ask me to find something — for you, or for someone you love.

Primary: **Take me home**

---

## 4. Home Tab

**View:** `HomeView`

### 4.1 Layout Structure

ScrollView with sections:

1. Greeting strip
2. Curated collections carousel
3. Upcoming occasions
4. Recommended for you
5. “Find something for…” entry

Background: solid black throughout.

### 4.2 Greeting Strip

Copy:

- Small line:  
  > “Good evening, [FirstName].”
- Sub:  
  > “Here’s what I’ve been quietly curating for you.”

Animation:

- Fade in + slight upward motion.
- If first day using: alt copy:  
  > “Let’s start a little gifting universe for you.”

### 4.3 Curated Collections

**Component:** `CollectionCarouselView`

- Horizontal scroll of `CollectionCardView`.
- Each card:
  - Full-bleed image.
  - Gradient fade at bottom.
  - Title + subtitle.

Example collection copy:

- Title: **For the Slow Morning Ritualist**  
  Sub: “Coffee, ceramics, and quiet.”

- Title: **Small but Unforgettable**  
  Sub: “Gifts under £50 that still feel big.”

Interactions:

- Cards slide in from right when section appears (staggered).
- On tap → `CollectionDetailView(collectionID)`.

### 4.4 Upcoming Occasions Strip

**Component:** `OccasionChipsView`

Header:  
> **Coming up soon**

Chip content:

- Avatar / initials.
- Name + relationship: “Mia · Sister”.
- Date / countdown: “In 6 days”.

Microcopy under chips:  
> “Tap an occasion and I’ll start shortlisting gifts right away.”

Tap chip → `OccasionDetailView(occasionID)`.

### 4.5 Recommended For You

Grid or horizontal scroll of `ProductCardView`.

Header:  
> **For your own wishlists**

Each card:

- Product image
- Brand (small caps)
- Title
- Price
- AI context label in small type:  
  > “Because you liked [Product]”  
  or  
  > “Matches your slow morning answers”

Tap → `ProductDetailView(productID)`.

### 4.6 “Find something for…”

Full-width faux-input card at bottom of Home.

Copy on card:  
> **Find something for…**

Subtext below:  
> “A friend, a partner, your dad, or even someone who isn’t on Gifter yet.”

Interaction:

- Tap → switches to **Find tab** and opens `FindEntryView` (or presents as full-screen sheet).

---

## 5. Find Tab – “Find Someone a Gift”

**View:** `FindView`

### 5.1 Entry Layout

- Search bar at top.
- Sections:
  - “People you gift most”
  - “Recent gifting profiles”
  - “Start a new profile”

Header text:

Title:  
> **Who are we shopping for?**

Subtitle:  
> Search by name, or create a quick gifting profile.

### 5.2 Search Behaviour

- Search field filters:
  - Friends (Gifter users connected).
  - Non-user profiles (stored locally / backend).

List row:

- Avatar / initials.
- Name.
- Relationship (“Friend”, “Partner”, “Colleague”).
- Subtext: “Last gifted: 3 months ago” (if data exists).

Tap friend row → `FriendContextView(friendID)`.

Tap existing non-user profile → `RecommendationsView(profileID)`.

### 5.3 Create New Gifting Profile

Button: **Create a new gifting profile**

Tap → `NewProfileView` (sheet).

Fields:

- Name (text field).
- Relationship (picker).
- “Three words that come to mind” (chips or free text).

Copy:

Title:  
> **Tell me who they are.**

Body:  
> Just enough so I don’t recommend socks to the friend who hates socks.

Primary: **Continue** → launches `TasteProfileView(mode: .nonUser)`.

---

## 6. Occasion Tab

**View:** `OccasionsView`

### 6.1 List Layout

Sections:

- “This month”
- “Later”

Row structure:

- Left: avatar / initials.
- Center:  
  - Line 1: `Name · Relationship`  
  - Line 2: `Occasion · Date`
- Right: pill: “Plan gift” / “In progress”.

Header:

> **Let’s not forget anyone.**

Subtext:

> I’ll nudge you before each big day, but you can start planning anytime.

Tap row → `OccasionDetailView(occasionID)`.

### 6.2 Occasion Detail

**View:** `OccasionDetailView`

Top summary card:

- Name, relationship.
- Occasion type + date + countdown.

Copy:

Title:  
> **Let’s find something for [Name].**

Body:  
> I’m using what you’ve told me about them — and what they’ve wished for — to shortlist a few things.

Below: `RecommendationsView` filtered by occasion and person.

Buttons:

- Top-right: “Edit occasion”
- CTA inside list when empty:  
  > “Ask Gifter for ideas” (if recs not yet loaded).

---

## 7. Collections Detail

**View:** `CollectionDetailView(collectionID)`

### Layout

- Large hero image (scrolls with parallax).
- Title & subtitle overlay on hero.
- Body section:

  - Short description paragraph.
  - Optional note: “Featuring brands: [X, Y, Z].”

- Product list/grid.

Example copy:

Title:  
> **For the Slow Morning Ritualist**

Body:  
> Coffee, ceramics, and quiet. Pieces for the friend who treats mornings like a small ceremony.

Microcopy near top:  
> “You can save things for later or jump straight to the brands to buy.”

---

## 8. Product Detail

**View:** `ProductDetailView(productID, context: .self | .person(Profile))`

### Layout

- Top: image carousel (pager dots).
- Middle content card:

  - Brand name (caps).
  - Product title.
  - Price.
  - Short description.
  - Chips: “For the ritualist”, “Under £50”, etc.
  - AI explanation.

Example AI copy:

Label: *Why I picked this*  
Text:  
> “You said they love slow, considered mornings and you’ve saved a few ceramics before. This keeps that same energy without repeating what they already have.”

### Actions

Primary button:

- If context self: **Save to my wishlist**
- If context person: **Save for [Name]**

Secondary button:

- **View & buy from store** (opens Mercur / web view).

Microcopy under secondary:

> “I’ll take you to the brand’s store to complete the purchase.”

Animations:

- On appear: image fades in, content slides up.
- On “Save”: heart icon fills & pulses, light haptic.

---

## 9. Wishlist / Gift Plans

**View:** `WishlistView`

### 9.1 Segmented Control

- Segments: `For me` | `For others`

### 9.2 “For me”

Grid of saved items.

Header:

> **Your wishlists**

Subtext:

> This is your quiet archive. I’ll surface these when people are shopping for you.

Long-press card menu:

- Remove.
- Move to list → “General”, “Home”, “Wardrobe”, etc.

### 9.3 “For others”

List of **gift plans** by person.

Row:

- Name + relationship.
- Subtext: “3 ideas saved · Next occasion: Birthday in 2 weeks.”

Tap → `GiftPlanDetailView(profileID)`:

- Items saved for that person.
- Button: **Ask for more ideas** → fetch more recs.

---

## 10. You Tab (Profile & Settings)

**View:** `ProfileView`

Sections:

1. **You**
   - Avatar, name, email.
   - Button: “Edit profile”.

2. **Your taste**
   - Chips summarizing taste profile: “Minimal”, “Homebody”, “Coffee”.
   - Button: **Refine my taste** → `TasteProfileView(mode: .userLight)`.

3. **Your occasions**
   - List of your own important dates.
   - Button: **Add an occasion**.

4. **Notifications**
   - Toggles:
     - “Remind me a week before”
     - “Remind me on the day”

5. **About**
   - Links: Privacy, Terms, “About Gifter”.

Copy header:

> **You & I**

Subtext:

> This is where I remember the things that matter to your gifting life.

---

## 11. Micro-Interactions & Animations

### 11.1 Bow Icon Behaviour

- When the app is “thinking” (fetching AI-powered recs):
  - Show small bow in nav bar or near loading text.
  - Animation: gentle nodding / bowing (rotate a few degrees and back).

- When AI explanations expand:
  - Bow appears as tiny avatar next to text with fade-in.

### 11.2 Loading States

- Skeleton cards (dark rectangles, rounded).
- Text:  
  > “Curating a few ideas…”

### 11.3 Error States

Copy:

> “Hmm. Something on my side glitched.”  
> “Let’s try that again.”

Button: **Retry**

---

## 12. Routing Map (Summary)

### 12.1 Auth Flow

- `SplashView`  
  → `WelcomeView`  
  → `SignupView` / `LoginView`  
  → `OnboardingIntroView` (first time only)  
  → `TasteProfileView(mode: .userDeep)`  
  → `MainTabView(HomeView)`  

### 12.2 Main Tabs

- `MainTabView`
  - Tab 1: `HomeView`
    - → `CollectionDetailView`
    - → `OccasionDetailView`
    - → `ProductDetailView`
    - → `FindView` (via “Find something for…”)
  - Tab 2: `FindView`
    - → `NewProfileView`
    - → `TasteProfileView(mode: .nonUser)`
    - → `FriendContextView`
    - → `RecommendationsView`
    - → `ProductDetailView`
  - Tab 3: `OccasionsView`
    - → `OccasionDetailView`
    - → `ProductDetailView`
  - Tab 4: `ProfileView`
    - → `EditProfileView`
    - → `TasteProfileView(mode: .userLight)`
    - → `OccasionEditView`

---

## 13. Tone Guidelines (Global)

Gifter speaks as **“I”**, in a calm, considerate, slightly playful tone:

- Avoid hype; no “OMG”, minimal exclamation marks.
- Short sentences, conversational.
- Always emphasise *care* and *fit* over shopping / consumption.

Examples:

- After saving an item:  
  > “Saved. I’ll remember this when it’s gifting time.”

- When no results:  
  > “Nothing feels quite right yet. Want to nudge me with a bit more detail?”

- Before a big date:  
  > “[Name]’s birthday is in 5 days. Want me to line up a few last-minute ideas?”

---

This markdown file is your **single source of truth** for the Swift app’s UX: screens, routing, copy, interactions, and motion, all aligned with the black-and-white editorial brand and the AI concierge bow from your prelaunch website.
