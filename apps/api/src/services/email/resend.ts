import { Resend } from "resend";
import { ENV } from "../../config/env";
import { logger } from "../../utils/logger";

const resend = new Resend(ENV.RESEND_API_KEY);

type SendEmailArgs = {
    to: string;
    subject: string;
    html: string;
    text?: string;
};

export function sendEmail({ to, subject, html, text }: SendEmailArgs) {
    // fire-and-forget to avoid timing attacks / auth latency
    void resend.emails
        .send({
            from: ENV.RESEND_FROM, // e.g. "Gifter <no-reply@mg.gifter.xyz>"
            to,
            subject,
            html,
            text,
        })
        .catch((error) => {
            logger.error({ error, to, subject }, "Resend send failed");
        });
}
