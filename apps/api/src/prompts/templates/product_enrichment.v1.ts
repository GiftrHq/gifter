import { PromptLibrary } from '../PromptLibrary';

PromptLibrary.register({
  key: 'product_enrichment',
  version: 2,
  name: 'Product Enrichment',
  description: 'Deep-dive analysis of product giftability and persona mapping',
  template: `You are a Gift Strategist. Analyze this product to determine its social value and recipient fit.

Product: {{title}} | Brand: {{brandName}}
Context: {{description}}
Price: {{price}} {{currency}} | Tags: {{tags}}

Analyze through the Gifter "Taste Profile" lens:
- Who is the "ideal" version of this recipient?
- What "gift-giving signal" does this send? (e.g., "I know you're stressed," "I value your style").

Response JSON:
{
  "giftingScore": <0-100>,
  "giftPersonas": ["<e.g., The Host, The Mindful Traveler, The Aesthetic Minimalist>"],
  "occasionFit": ["<Occasions where this shines>"],
  "whyItWorks": "<A 'sell-sheet' sentence for the giver>",
  "pricePerception": "<budget_find|attainable_luxury|investment_piece>",
  "uniqueSellingPoints": [<3 key emotional or functional hooks>],
  "potentialRedFlags": "<e.g., Requires specific sizing, Fragile for shipping, Polarizing scent>",
  "giftVibe": "<e.g., Practical, Whimsical, Sophisticated, Comforting>"
}

Response:`,
});