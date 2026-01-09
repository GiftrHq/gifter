import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../config/auth.js";
import { logger } from "../utils/logger.js";

function toHeaders(h: FastifyRequest["headers"]) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(h)) {
    if (!v) continue;
    headers.append(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  return headers;
}

export class AuthController {
  static async handleAuth(request: FastifyRequest, reply: FastifyReply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = toHeaders(request.headers);

      // If you rely on Fastify body parsing, this is fine for JSON.
      // For form posts, you may want the raw stream (see note below).
      const body =
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body
            ? typeof request.body === "string"
              ? request.body
              : JSON.stringify(request.body)
            : undefined;

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body,
      });

      const res = await auth.handler(req);

      const responseText = await res.text();

      // Log 403 responses for debugging
      if (res.status === 403) {
        logger.error({
          url: request.url,
          status: res.status,
          body: responseText
        }, "Auth request returned 403");
      }

      reply.status(res.status);
      res.headers.forEach((value, key) => reply.header(key, value));
      reply.send(responseText);
    } catch (error) {
      logger.error({ error }, "Better Auth handler failed");
      reply.status(500).send({ error: "AUTH_FAILURE" });
    }
  }

  static async getSession(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: toHeaders(request.headers), // ✅ Better Auth expects Headers :contentReference[oaicite:2]{index=2}
    });

    return reply.send({ session });
  }
}
