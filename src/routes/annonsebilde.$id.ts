import { createFileRoute } from "@tanstack/react-router";
import { decodeDataImage } from "@/lib/listing-image-url";

const ID = /^[A-Za-z0-9_-]{1,80}$/;

export const Route = createFileRoute("/annonsebilde/$id")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = decodeURIComponent(url.pathname.split("/").filter(Boolean)[1] ?? "");
        const index = Number(url.searchParams.get("i") ?? "0");
        if (!ID.test(id) || !Number.isInteger(index) || index < 0 || index > 14) return new Response(null, { status: 404 });
        try {
          const { publicArtClient } = await import("@/lib/visual-art-public.server");
          const { data: row, error } = await publicArtClient()
            .from("listings")
            .select("data,moderation_status,deleted_at,blocked")
            .eq("id", id)
            .eq("moderation_status", "published")
            .is("deleted_at", null)
            .eq("blocked", false)
            .maybeSingle();
          if (error || !row) return new Response(null, { status: 404 });
          const data = row.data as { image?: string; images?: string[] };
          const sources = Array.isArray(data.images) && data.images.length ? data.images : data.image ? [data.image] : [];
          const image = decodeDataImage(sources[index] ?? "");
          if (!image) return new Response(null, { status: 404 });
          const cache = url.searchParams.has("v") ? "public, max-age=86400" : "public, max-age=300";
          const body = new ArrayBuffer(image.bytes.byteLength);
          new Uint8Array(body).set(image.bytes);
          return new Response(body, {
            headers: {
              "content-type": image.type,
              "cache-control": cache,
              "x-robots-tag": "noindex",
            },
          });
        } catch {
          return new Response(null, { status: 404 });
        }
      },
    },
  },
});
