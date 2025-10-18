import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Basic CORS headers for cross-origin requests from the Vite dev server / frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Uploadthing-Api-Key",
};

// UploadThing file router endpoint
http.route({
  path: "/api/uploadthing",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const uploadthingToken = process.env.UPLOADTHING_TOKEN;
    
    if (!uploadthingToken) {
      return new Response(JSON.stringify({ error: "UploadThing not configured" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json();
      
      // Handle different UploadThing requests
      if (body.actionType === "upload") {
        // This is an upload request - get presigned URLs
        const files = body.files || [];
        
        const presignResponse = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Uploadthing-Api-Key": uploadthingToken,
          },
          body: JSON.stringify({ files }),
        });

        if (!presignResponse.ok) {
          const errorText = await presignResponse.text();
          return new Response(JSON.stringify({ error: errorText }), { 
            status: presignResponse.status,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const presignData = await presignResponse.json();
        return new Response(JSON.stringify(presignData), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } else {
        // Return file router configuration
        const fileRouter = {
          imageUploader: {
            maxFileSize: "4MB",
            maxFileCount: 5,
          },
          videoUploader: {
            maxFileSize: "32MB",
            maxFileCount: 3,
          },
        };

        return new Response(JSON.stringify(fileRouter), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    } catch (error) {
      console.error("UploadThing router error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  }),
});

// Handle GET requests for file router config
http.route({
  path: "/api/uploadthing",
  method: "GET",
  handler: httpAction(async () => {
    const fileRouter = {
      imageUploader: {
        maxFileSize: "4MB",
        maxFileCount: 5,
      },
      videoUploader: {
        maxFileSize: "32MB",
        maxFileCount: 3,
      },
    };

    return new Response(JSON.stringify(fileRouter), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }),
});

// Facebook OAuth callback handler
http.route({
  path: "/api/auth/facebook/callback",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    try {
      const url = new URL(req.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      // Handle OAuth errors
      if (error) {
        const errorDescription = url.searchParams.get("error_description") || "Unknown error";
        return new Response(
          JSON.stringify({ error, error_description: errorDescription }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      if (!code || !state) {
        return new Response(
          JSON.stringify({ error: "Missing code or state parameter" }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Call the Convex action to handle the callback
      const result = await ctx.runAction(api.metaAuth.handleFacebookCallback, {
        code,
        state,
      });

      // Redirect to success page
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const redirectUrl = new URL("/dashboard?social=connected", frontendUrl);
      
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl.toString(),
          ...corsHeaders,
        },
      });
    } catch (error) {
      console.error("Facebook OAuth callback error:", error);
      
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const redirectUrl = new URL("/dashboard?social=error", frontendUrl);
      
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl.toString(),
          ...corsHeaders,
        },
      });
    }
  }),
});

// Preflight CORS handler
http.route({
  path: "/api/uploadthing",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// Preflight CORS handler for Facebook callback
http.route({
  path: "/api/auth/facebook/callback",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

export default http;
