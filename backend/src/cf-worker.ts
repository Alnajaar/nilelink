
interface Env {
    // Environment variables
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        
        // Advanced Security Headers (CORS & Security)
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*", // In production allow specific origins
            "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-tenant-subdomain",
            "Access-Control-Max-Age": "86400",
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
        };

        if (request.method === "OPTIONS") {
             return new Response(null, { headers: corsHeaders });
        }

        // Health Check Endpoint
        if (url.pathname === "/health" || url.pathname === "/api/health") {
            return new Response(JSON.stringify({ 
                status: "healthy", 
                environment: "edge-worker",
                region: request.cf?.colo || "unknown",
                timestamp: new Date().toISOString()
            }), {
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }

        // Main Entry Response
		return new Response("NileLink API Edge Gateway (Phase 23 Active)", { 
            headers: { "Content-Type": "text/plain", ...corsHeaders } 
        });
	},
};
