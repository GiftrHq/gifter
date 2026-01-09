import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../services/prisma.js";
import { ENV } from "./env.js"
import { emailOTP, magicLink } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey"; // ✅
import { sendEmail } from "../services/email/resend.js";
import { otpEmailTemplate, magicLinkTemplate } from "../services/email/templates.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    // No explicit field mappings needed if schema names match Better Auth defaults
  }),
  secret: ENV.BETTER_AUTH_SECRET,
  baseUrl: ENV.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disabled until Resend domain is verified
    autoSignIn: true, // Auto sign in after signup
  },
  emailVerification: {
    sendOnSignUp: false, // Disabled until Resend domain is verified
    autoSignInAfterVerification: true,
    sendVerificationOnSignUp: false,
  },
  socialProviders: {
    apple: {
      clientId: ENV.APPLE_CLIENT_ID!,
      teamId: ENV.APPLE_TEAM_ID!,
      keyId: ENV.APPLE_KEY_ID!,
      privateKey: ENV.APPLE_PRIVATE_KEY!,
    },
  },
  plugins: [
    // emailOTP({
    //   // Key setting if you want “verify email” to be OTP-based instead of link-based:
    //   overrideDefaultEmailVerification: true, // :contentReference[oaicite:1]{index=1}
    //   async sendVerificationOTP({ email, otp, type }) {
    //     const tpl = otpEmailTemplate({ otp, type });
    //     sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    //   },
    // }),

    magicLink({
      async sendMagicLink({ email, url }) {
        const tpl = magicLinkTemplate({ url });
        sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
      },
    }),

    passkey(),
  ],
});
