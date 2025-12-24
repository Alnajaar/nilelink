export interface Env {
    // NileLink Protocol Environment
    ENVIRONMENT: string;
    DB: D1Database;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const method = request.method;

        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        };

        if (method === "OPTIONS") return new Response(null, { headers: corsHeaders });

        if (url.pathname === "/health") {
            return new Response(JSON.stringify({
                status: "active",
                protocol: "NileLink v0.1.0",
                environment: env.ENVIRONMENT,
                db: "connected"
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (url.pathname === "/sync" && method === "POST") {
            try {
                const events: any[] = await request.json();
                if (!Array.isArray(events)) throw new Error("Batch sync required");

                // Bulk insert into D1 Ledger
                const statements = events.map(event => {
                    return env.DB.prepare(
                        `INSERT INTO events (id, event_type, entity_type, entity_id, payload, device_id) 
                         VALUES (?, ?, ?, ?, ?, ?)`
                    ).bind(
                        event.id,
                        event.type,
                        event.entityType,
                        event.entityId,
                        JSON.stringify(event.payload),
                        event.deviceId
                    );
                });

                await env.DB.batch(statements);

                return new Response(JSON.stringify({
                    success: true,
                    synced_count: events.length
                }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            } catch (err: any) {
                return new Response(JSON.stringify({ error: err.message }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
        }

        if (url.pathname === "/events" && method === "GET") {
            const streamId = url.searchParams.get("streamId");
            if (!streamId) return new Response("Missing streamId", { status: 400 });

            // In v0.1: streamId is often entity_type:entity_id
            const [entityType, entityId] = streamId.split(":");

            const { results } = await env.DB.prepare(
                "SELECT * FROM events WHERE entity_type = ? AND entity_id = ? ORDER BY timestamp ASC"
            ).bind(entityType, entityId).all();

            return new Response(JSON.stringify({
                events: results.map((r: any) => ({
                    eventId: r.id,
                    type: r.event_type,
                    item: JSON.parse(r.payload),
                    producerId: r.device_id,
                    timestamp: r.timestamp
                }))
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response("N NileLink Gateway v0.1.0", {
            headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
    },
};
