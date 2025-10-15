import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

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
    };

    return new Response(JSON.stringify(fileRouter), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
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

export default http;
