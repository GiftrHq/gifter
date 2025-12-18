# Gifter Brand Panel

The **Brand Panel** is an editorial, black & white merchant portal for brands selling through Gifter. It provides a calm, minimal interface for brands to manage their catalog, orders, and payouts.

## Design System

### Colors

- `PanelBlack (#000000)` - Primary background
- `PanelOffBlack (#050505)` - Cards and chrome
- `PanelWhite (#FFFFFF)` - Primary text and important surfaces
- `PanelGray (#8A8A8A)` - Secondary text
- `PanelSoftGray (#161616)` - Borders and dividers

### Typography

- **Headings**: Playfair Display (editorial serif)
- **Body**: Inter (clean sans-serif)
- **Labels**: Uppercase with tracking

### Components

- **Primary Button**: White background, black text, hover scale effect
- **Secondary Button**: Transparent with white border
- **Card**: Off-black background with soft gray border
- **Input**: Black background with soft gray border

## Features

### Dashboard
- Welcome message with brand name
- Status card showing approval and onboarding state
- Onboarding checklist (profile, products, payouts)
- Key metrics (orders, revenue, top product)
- Recent orders glimpse

### Catalog
- Product list view with search and filters
- Add product button
- Product status indicators (Published/Draft/Archived)
- Stock and price information
- *Note: Product editor pages need to be wired to Payload API*

### Orders
- Orders table with filtering
- Order status (Pending/Paid/Fulfilled/Refunded)
- Buyer information and order totals
- *Note: Order detail view needs to be implemented*

### Customers
- List of customers who have ordered
- Order count and last order date
- *Note: Read-only in v1, no marketing campaigns*

### Payouts
- Stripe Connect onboarding flow
- Three states: not_started, in_progress, complete
- Payout log (future feature)
- *Note: Stripe onboarding link generation needs API integration*

### Settings
- Brand profile editing
- Gift positioning and style tags
- Business details (country, currency, website, socials)
- *Note: Save functionality needs API integration*

## Tech Stack

- **Next.js 15** - App Router with React 19
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with custom design system
- **Framer Motion** - Subtle animations (for future enhancement)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3002`.

## Pages

- `/` - Redirects to dashboard
- `/dashboard` - Main dashboard
- `/catalog` - Product list
- `/catalog/products/new` - Add new product (stub)
- `/catalog/products/[id]` - Edit product (stub)
- `/orders` - Orders list
- `/orders/[id]` - Order detail (stub)
- `/customers` - Customers list
- `/payouts` - Stripe onboarding & payouts
- `/settings/brand` - Brand profile settings

## Next Steps

### API Integration

1. **Authentication**
   - Implement auth with Payload API
   - Session management
   - Brand-scoped access control

2. **Product Management**
   - Fetch products from Payload API
   - Create/edit product flow with all fields from spec
   - Image upload handling
   - Gift tags and occasion fit selection
   - Variant management

3. **Order Management**
   - Fetch orders from Payload API
   - Order detail view with fulfillment actions
   - Status update functionality

4. **Stripe Integration**
   - Stripe Connect onboarding link generation
   - Webhook handling for account status updates
   - Payout history display

5. **Settings**
   - Save brand profile updates
   - Image upload for logo and cover

### UI Enhancements

1. **Animations**
   - Implement fade-in-up animations on page load
   - Card stagger animations
   - Button press feedback

2. **Product Editor**
   - Multi-tab product form (Basics, Media, Variants, Gift Context, Visibility)
   - Rich text editor for descriptions
   - Auto-save indicator
   - Unsaved changes warning

3. **Order Detail**
   - Two-column layout (order info + payment/fulfillment)
   - Line items table
   - Shipping address display
   - Fulfillment actions

## Design Guidelines

- **Keep it calm**: Use subtle animations, no bounce or aggressive motion
- **Editorial spacing**: Generous whitespace, clear hierarchy
- **Voice**: Gifter speaks as "I" - calm, luxury AI concierge
- **No color**: Product photography is the only color
- **Typography**: Playfair for headlines, Inter for body, uppercase for labels

## Production Checklist

- [ ] Environment variables configuration
- [ ] API endpoint URLs
- [ ] Authentication flow
- [ ] Error boundaries
- [ ] Loading states
- [ ] Empty states
- [ ] Form validation
- [ ] Image optimization
- [ ] SEO meta tags
- [ ] Analytics integration
