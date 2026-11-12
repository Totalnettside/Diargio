import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { applyDocumentSeo } from "./lib/seo";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const documentSeo = createMiddleware().server(async ({ next, request }) => {
  if (new URL(request.url).pathname.startsWith('/lovable/')) return next();
  const result = await next();
  const response = result.response;
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) return result;
  const html = await response.text();
  const nextHtml = applyDocumentSeo(html, { pathname: result.pathname, status: response.status });
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  return new Response(nextHtml, { status: response.status, statusText: response.statusText, headers });
});

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  if (new URL(request.url).pathname.startsWith("/lovable/")) {
    return next();
  }
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [documentSeo, errorMiddleware, csrfMiddleware],
}));
