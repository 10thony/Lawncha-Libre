export async function uploadImagesWithUploadThing(files: File[]): Promise<string[]> {
  if (!files.length) return [];

  const serverBase = (import.meta as any).env?.VITE_UPLOADTHING_URL as string | undefined;
  const clientApiKey = (import.meta as any).env?.VITE_UPLOADTHING_TOKEN as string | undefined;

  // Prefer backend route that uses server-side UPLOADTHING_TOKEN
  let presignData: any;
  if (serverBase) {
    const base = serverBase.replace(/\/$/, "");
    const presignRes = await fetch(`${base}/api/uploadthing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionType: "upload",
        files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      }),
    });
    if (!presignRes.ok) {
      // If backend route isn't deployed yet, optionally fall back to client token
      if (clientApiKey) {
        const text = await presignRes.text();
        console.warn("Backend presign failed, falling back to client token:", text);
        const directRes = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Uploadthing-Api-Key": clientApiKey,
          },
          body: JSON.stringify({
            files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
          }),
        });
        if (!directRes.ok) {
          const text2 = await directRes.text();
          throw new Error(text2 || "Failed to presign UploadThing URLs (fallback)");
        }
        presignData = await directRes.json();
      } else {
        const text = await presignRes.text();
        throw new Error(text || "Failed to presign via backend /api/uploadthing");
      }
    } else {
      presignData = await presignRes.json();
    }
  } else if (typeof window !== "undefined") {
    // Dev convenience: use relative path and let Vite proxy to Convex
    const presignRes = await fetch(`/api/uploadthing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionType: "upload",
        files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      }),
    });
    if (!presignRes.ok) {
      if (clientApiKey) {
        const text = await presignRes.text();
        console.warn("Local backend presign failed, falling back to client token:", text);
        const directRes = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Uploadthing-Api-Key": clientApiKey,
          },
          body: JSON.stringify({
            files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
          }),
        });
        if (!directRes.ok) {
          const text2 = await directRes.text();
          throw new Error(text2 || "Failed to presign UploadThing URLs (fallback)");
        }
        presignData = await directRes.json();
      } else {
        const text = await presignRes.text();
        throw new Error(text || "Failed to presign via local /api/uploadthing");
      }
    } else {
      presignData = await presignRes.json();
    }
  } else if (clientApiKey) {
    // Fallback: direct UploadThing call from client (only if explicitly configured)
    const presignRes = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": clientApiKey,
      },
      body: JSON.stringify({
        files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      }),
    });
    if (!presignRes.ok) {
      const text = await presignRes.text();
      throw new Error(text || "Failed to presign UploadThing URLs");
    }
    presignData = await presignRes.json();
  } else {
    throw new Error(
      "Missing configuration: set VITE_UPLOADTHING_URL (preferred) or VITE_UPLOADTHING_TOKEN."
    );
  }

  // Expecting an array mapping to input files
  const targets: Array<any> = Array.isArray(presignData)
    ? presignData
    : presignData?.data ?? [];

  if (!Array.isArray(targets) || targets.length !== files.length) {
    throw new Error("Unexpected UploadThing response shape");
  }

  const uploadedUrls: string[] = [];

  // Step 2: Upload each file to its storage URL
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const target = targets[i];

    // Common fields across UT API responses
    const uploadUrl: string = target?.url || target?.uploadUrl || target?.presignedUrl;
    const key: string | undefined = target?.key || target?.fileKey || target?.file?.key;
    const finalUrlFromApi: string | undefined = target?.fileUrl || target?.urlForDownload;

    if (!uploadUrl) throw new Error("Missing upload URL from UploadThing");

    // Some presigns require multipart/form-data POST with provided fields (S3 POST)
    if (target?.fields && typeof target.fields === "object") {
      const form = new FormData();
      Object.entries(target.fields as Record<string, string>).forEach(([k, v]) => {
        form.append(k, v);
      });
      form.append("file", file, file.name);

      const postRes = await fetch(uploadUrl, {
        method: "POST",
        body: form,
      });
      if (!postRes.ok) {
        const text = await postRes.text();
        throw new Error(text || `Failed to upload file (POST): ${file.name}`);
      }
      const locationHeader = postRes.headers.get("Location") || postRes.headers.get("location");
      const publicUrl = finalUrlFromApi || locationHeader || (key ? `https://utfs.io/f/${key}` : undefined);
      if (!publicUrl) throw new Error("Could not determine uploaded file URL");
      uploadedUrls.push(publicUrl);
      continue;
    }

    // Otherwise, use PUT with any required headers
    const extraHeaders: Record<string, string> = {};
    if (target?.headers && typeof target.headers === "object") {
      for (const [k, v] of Object.entries(target.headers as Record<string, string>)) {
        extraHeaders[k] = v;
      }
    }
    if (!extraHeaders["Content-Type"]) {
      extraHeaders["Content-Type"] = file.type || "application/octet-stream";
    }

    const putRes = await fetch(uploadUrl, {
      method: (target?.method as string) || "PUT",
      headers: extraHeaders,
      body: file,
    });

    if (!putRes.ok) {
      const text = await putRes.text();
      throw new Error(text || `Failed to upload file (PUT): ${file.name}`);
    }

    const locationHeader = putRes.headers.get("Location") || putRes.headers.get("location");
    const publicUrl = finalUrlFromApi || locationHeader || (key ? `https://utfs.io/f/${key}` : undefined);
    if (!publicUrl) throw new Error("Could not determine uploaded file URL");
    uploadedUrls.push(publicUrl);
  }

  return uploadedUrls;
}


