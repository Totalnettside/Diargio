import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/hooks/useAuth";
import { ChatProvider } from "@/hooks/useChat";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { ActionDialogs } from '@/components/ActionDialogs';
import { DEFAULT_TITLE, NOT_FOUND_DESCRIPTION, NOT_FOUND_TITLE, OG_IMAGE, isPrivatePath } from '@/lib/seo';

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-semibold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Fant ikke siden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Siden finnes ikke, eller annonsen er fjernet.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error as Error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Siden lastet ikke
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Prøv igjen, eller gå til forsiden.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Prøv igjen
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground"
          >
            Til forsiden
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ matches }) => {
    const path = [...matches].reverse().find((match) => match.pathname)?.pathname ?? "/";
    const notFound = matches.some((match) => match._notFound || match.status === "notFound");
    const privatePage = isPrivatePath(path);
    const title = notFound ? NOT_FOUND_TITLE : DEFAULT_TITLE;
    const description = notFound
      ? NOT_FOUND_DESCRIPTION
      : "Diargio er markedsplassen for kunst i Norge. Kjøp og selg originalkunst, trykk og fotografi.";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: OG_IMAGE },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        ...((notFound || privatePage) ? [{ name: "robots", content: "noindex" }] : []),
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700&display=swap",
        },
        { rel: "icon", href: "/favicon.ico?v=2", sizes: "any" },
        { rel: "icon", href: "/favicon.png?v=2", type: "image/png" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=2" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="nb">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <StoreProvider>
      <ChatProvider>
      <ActionDialogs>
        <div className="min-h-screen bg-mist pb-24 font-body text-ink md:pb-0">
          <TopBar />
          {/* Required: nested routes render here. */}
          <div className="site-content"><Outlet /></div>
          <Footer />
          <BottomNav />
          <OnboardingDialog />
        </div>
      </ActionDialogs>
      </ChatProvider>
      </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
