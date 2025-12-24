export interface Env {
    DB: D1Database;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // Global CORS
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // Routing
        if (url.pathname === "/health") {
            return new Response(JSON.stringify({ status: "ok", version: "1.0.0" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (url.pathname === "/anchor" && request.method === "POST") {
            try {
                const body: any = await request.json();
                const { hash, type, origin, payload } = body;

                if (!hash || !type || !origin) {
                    return new Response("Missing required fields", { status: 400, headers: corsHeaders });
                }

                // Anchor to D1
                await env.DB.prepare(
                    "INSERT INTO events (hash, type, origin, payload, timestamp) VALUES (?, ?, ?, ?, ?)"
                )
                    .bind(hash, type, origin, JSON.stringify(payload), Date.now())
                    .run();

                return new Response(JSON.stringify({ status: "anchored", hash }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            } catch (e: any) {
                return new Response(e.message, { status: 500, headers: corsHeaders });
            }
        }

        if (url.pathname === "/verify" && request.method === "GET") {
            const hash = url.searchParams.get("hash");
            if (!hash) return new Response("Missing hash", { status: 400, headers: corsHeaders });

            const event = await env.DB.prepare("SELECT * FROM events WHERE hash = ?")
                .bind(hash)
                .first();

            if (!event) {
                return new Response(JSON.stringify({ verified: false }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            return new Response(JSON.stringify({ verified: true, event }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response("NileLink Edge Gateway", { headers: corsHeaders });
    },
};
