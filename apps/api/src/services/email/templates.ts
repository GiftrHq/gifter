export function otpEmailTemplate(params: { otp: string; type: string }) {
    const { otp, type } = params;
    return {
        subject: type === "email-verification" ? "Verify your email" : "Your Gifter code",
        text: `Your Gifter code is: ${otp}`,
        html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height:1.4">
        <h2 style="margin:0 0 12px 0">Your Gifter code</h2>
        <p style="margin:0 0 16px 0">Use this code to continue:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:6px; padding:14px 16px; border:1px solid #eee; display:inline-block; border-radius:12px">
          ${otp}
        </div>
        <p style="margin:16px 0 0 0; color:#666; font-size:12px">
          If you didn’t request this, you can ignore this email.
        </p>
      </div>
    `,
    };
}

export function magicLinkTemplate(params: { url: string }) {
    const { url } = params;
    return {
        subject: "Sign in to Gifter",
        text: `Sign in using this link: ${url}`,
        html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height:1.4">
        <h2 style="margin:0 0 12px 0">Sign in to Gifter</h2>
        <p style="margin:0 0 16px 0">Tap to continue:</p>
        <p style="margin:0">
          <a href="${url}" style="display:inline-block; padding:12px 16px; border-radius:12px; background:#111; color:#fff; text-decoration:none">
            Continue
          </a>
        </p>
        <p style="margin:16px 0 0 0; color:#666; font-size:12px">
          If you didn’t request this, you can ignore this email.
        </p>
      </div>
    `,
    };
}