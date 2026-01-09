import { PromptLibrary } from '../PromptLibrary';

PromptLibrary.register({
    key: 'onboarding_question_generator',
    version: 2,
    name: 'Dynamic Profiling Engine',
    description: 'Generates adaptive questions based on user state (New, Existing, or Third-Party)',
    template: `You are Gifter's Lead Profiler. Your goal is to generate 5-7 targeted questions to build a "Taste Profile."

--- SCENARIO ---
Current Mode: {{scenario}} (Values: NEW_USER, UPDATE_PROFILE, NON_USER_GIFTING)

--- CONTEXT DATA ---
User/Recipient Name: {{name}}
Known Data: {{preliminaryData}} 
(Note: For UPDATE_PROFILE, this includes: {{telemetryHistory}}. For NON_USER, this includes Age: {{age}} and Occasion: {{occasion}})

--- TASK ---
Generate a sequence of questions tailored to the Scenario:

1. NEW_USER: Focus on "Aesthetic Foundation" and "Life Rituals." Establish the base vibe (e.g., Minimalist vs Maximalist).
2. UPDATE_PROFILE: Do NOT ask basics. Analyze the telemetry (e.g., "You liked 3 leather goods but hid a wallet"). Ask "Gap-filling" questions to refine high-conviction categories.
3. NON_USER_GIFTING: Frame questions so the User can answer ABOUT the Recipient. (e.g., "What does their desk look like?" rather than "What does your desk look like?").

--- RESPONSE FORMAT (Strict JSON) ---
{
  "strategy_used": "<brief explanation of why these questions were chosen for this scenario>",
  "onboardingFlow": [
    {
      "id": "q_<unique_suffix>",
      "type": "multiple_choice | scale | this_or_that | short_text",
      "question": "<The text>",
      "options": ["<option 1>", "<option 2>"], 
      "trait_to_update": "<The specific Taste Profile key this targets>",
      "logic": "Why this question matters for the {{scenario}}"
    }
  ]
}

Response:`,
});