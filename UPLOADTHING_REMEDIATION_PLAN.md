# UploadThing Implementation Remediation Plan

## Executive Summary
Your current implementation has several critical issues that are causing image upload failures. This plan outlines the problems and provides step-by-step solutions.

---

## Current Implementation Analysis

### What You Have Now (`convex/uploads.ts`)
```typescript
export const uploadToUploadThing = action({
  handler: async (ctx, args) => {
    // ❌ PROBLEM 1: Manual API calls instead of using UploadThing SDK
    const presignResponse = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": uploadthingToken,
      },
      // ❌ PROBLEM 2: Using uploadFiles endpoint incorrectly
      // This endpoint expects presigned URL workflow
      body: JSON.stringify({
        files: [{
          name: args.fileName,
          size: buffer.length,
          type: args.fileType,
        }],
      }),
    });
    
    // ❌ PROBLEM 3: Trying to return URL from presigned data
    // The workflow is incomplete and doesn't match UploadThing's expected flow
    return uploadData.fileUrl || uploadData.url;
  }
});
```

### Issues Identified

#### 🔴 Critical Issues

1. **Incorrect API Usage**
   - You're manually calling the UploadThing API instead of using their SDK
   - The `uploadFiles` endpoint workflow is more complex than your implementation handles
   - Missing proper multipart upload handling

2. **Missing SDK Integration**
   - You have `uploadthing` npm package installed but not using it
   - Should use `UTApi` class for server-side uploads

3. **Base64 Transfer Inefficiency**
   - Converting files to base64 in the browser and sending to Convex is wasteful
   - Increases payload size by ~33%
   - Convex has 10MB limit on action arguments

4. **Incomplete Upload Workflow**
   - UploadThing's `uploadFiles` API returns presigned URLs
   - You upload to the presigned URL but don't complete the upload lifecycle
   - Missing callback/completion steps

5. **No Error Recovery**
   - No retry logic
   - Poor error messages
   - No validation of upload completion

#### 🟡 Medium Priority Issues

6. **No File Validation**
   - No client-side file type checking
   - No size limits enforced
   - Could waste quota on invalid uploads

7. **Environment Variable Management**
   - Token should use `UPLOADTHING_SECRET` (not `UPLOADTHING_TOKEN`)
   - No validation that token is set during development

---

## Recommended Solutions

### Approach 1: Use UploadThing React Hooks (Recommended) ⭐

This is the most robust and officially supported approach.

#### Benefits:
- ✅ Direct client-to-UploadThing upload (no Convex middleman)
- ✅ Automatic retry and error handling
- ✅ Progress tracking built-in
- ✅ Properly integrated with UploadThing's infrastructure
- ✅ No payload size concerns

#### Implementation Steps:

**Step 1: Create UploadThing Core Configuration**

Create a new file to set up UploadThing route handler. Since you're not using Next.js, you'll need to adapt this for your setup:

```typescript
// src/lib/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      // Add auth here if needed
      // For now, allow all uploads but you should add Clerk auth
      return { userId: "temp" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for user:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
```

**Step 2: Set Up UploadThing Endpoint**

You need an HTTP endpoint to handle UploadThing callbacks. Add to your Convex setup:

```typescript
// convex/http.ts (or create if doesn't exist)
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// UploadThing endpoint
http.route({
  path: "/uploadthing",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    // Forward to UploadThing
    const uploadthingSecret = process.env.UPLOADTHING_SECRET;
    
    if (!uploadthingSecret) {
      return new Response("Missing UPLOADTHING_SECRET", { status: 500 });
    }

    // Get the request body
    const body = await req.text();
    
    // This is a simplified handler - you may need to adjust based on your needs
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
```

**Step 3: Update React Component to Use UploadThing Hook**

```typescript
// src/components/ui/image-uploader.tsx
import { useState } from "react";
import { useUploadThing } from "@uploadthing/react";
import { Button } from "./button";
import { Label } from "./label";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onImagesChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload complete:", res);
      const newUrls = res?.map((file) => file.url) || [];
      onImagesChange([...images, ...newUrls]);
      setUploading(false);
      setUploadProgress(0);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setUploadError(error.message);
      setUploading(false);
      setUploadProgress(0);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the max
    if (images.length + files.length > maxImages) {
      setUploadError(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      await startUpload(Array.from(files));
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to upload images");
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div>
      <Label>Project Images (Optional)</Label>
      <div className="mt-2 space-y-4">
        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Project image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {images.length < maxImages && (
          <div>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading || isUploading}
            />
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                disabled={uploading || isUploading}
                onClick={() => document.getElementById("image-upload")?.click()}
                className="w-full"
              >
                {uploading || isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Images ({images.length}/{maxImages})
                  </>
                )}
              </Button>
            </label>
          </div>
        )}

        {uploadError && (
          <p className="text-sm text-red-600">{uploadError}</p>
        )}
        
        <p className="text-sm text-gray-500">
          Upload project photos (before/after, progress shots, etc.)
        </p>
      </div>
    </div>
  );
}
```

**Step 4: Configure UploadThing Provider**

```typescript
// src/main.tsx or App.tsx
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { uploadRouter } from "./lib/uploadthing";

// Wrap your app with UploadThing context
function App() {
  return (
    <>
      <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
      {/* Your existing app */}
    </>
  );
}
```

**Step 5: Environment Variables**

Update your `.env.local`:
```bash
UPLOADTHING_SECRET=sk_live_... # Get from uploadthing.com dashboard
UPLOADTHING_APP_ID=your_app_id
```

---

### Approach 2: Use UploadThing SDK in Convex (Alternative)

If you must keep uploads server-side through Convex:

```typescript
// convex/uploads.ts
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { UTApi } from "uploadthing/server";

export const uploadToUploadThing = action({
  args: {
    fileData: v.string(), // base64 encoded file
    fileName: v.string(),
    fileType: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const uploadthingSecret = process.env.UPLOADTHING_SECRET;
    
    if (!uploadthingSecret) {
      throw new Error("UPLOADTHING_SECRET not configured");
    }

    try {
      // Initialize UTApi with your secret
      const utapi = new UTApi({
        apiKey: uploadthingSecret,
      });

      // Convert base64 to buffer
      const base64Data = args.fileData.split(',')[1] || args.fileData;
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Create a File object from buffer
      const file = new File([buffer], args.fileName, { type: args.fileType });

      // Upload using UTApi
      const response = await utapi.uploadFiles(file);
      
      if (response.error) {
        throw new Error(`Upload failed: ${response.error.message}`);
      }

      if (!response.data || !response.data.url) {
        throw new Error("No URL returned from upload");
      }

      return response.data.url;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to upload image");
    }
  },
});
```

---

## Additional Recommendations

### 1. File Validation
Add client-side validation before upload:

```typescript
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }
  return null;
}
```

### 2. Image URLs in Database
Currently storing URLs as strings in `imageUrls` array. Consider adding:
- Image metadata (width, height, size)
- Upload timestamp
- Original filename

### 3. Error Handling Improvements
```typescript
class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'UploadError';
  }
}
```

### 4. Loading States
Add better UX with:
- Individual file progress bars
- Cancel upload functionality
- Preview before upload

### 5. Clean Up Unused Uploads
Create a Convex cron to clean up orphaned uploads:
```typescript
// Track which image URLs are actually used in documents
// Delete unused images from UploadThing periodically
```

---

## Migration Steps

1. ✅ **Review this plan** - Understand the changes needed
2. 📝 **Choose approach** - Approach 1 (React hooks) or Approach 2 (SDK)
3. 🔧 **Set up environment** - Get UPLOADTHING_SECRET from dashboard
4. 💻 **Implement changes** - Follow code examples above
5. 🧪 **Test thoroughly** - Try various file sizes and types
6. 🚀 **Deploy** - Update production environment variables
7. 🗑️ **Clean up** - Remove old `convex/uploads.ts` if using Approach 1

---

## Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images (up to limit)
- [ ] Try to upload over limit (should fail gracefully)
- [ ] Upload large file (should show progress)
- [ ] Upload invalid file type (should reject)
- [ ] Upload oversized file (should reject)
- [ ] Network interruption during upload (should handle)
- [ ] Remove uploaded image
- [ ] Submit form with images
- [ ] Verify images persist after page reload

---

## Common Errors and Solutions

### "Failed to get upload URL"
- **Cause**: Invalid API key or wrong endpoint
- **Fix**: Verify UPLOADTHING_SECRET is correct

### "No upload data returned"
- **Cause**: API response structure changed
- **Fix**: Use UTApi SDK instead of raw fetch

### "Upload successful but image not showing"
- **Cause**: Wrong URL being saved
- **Fix**: Use `response.data.url` from UTApi

### "Upload stuck at 99%"
- **Cause**: Missing completion callback
- **Fix**: Ensure `onUploadComplete` is called

---

## Resources

- [UploadThing Documentation](https://docs.uploadthing.com/)
- [UploadThing React Guide](https://docs.uploadthing.com/getting-started/react)
- [UTApi Reference](https://docs.uploadthing.com/api-reference/server#utapi)
- [Convex File Storage](https://docs.convex.dev/file-storage) - Alternative to UploadThing

---

## Conclusion

**Recommended Next Steps:**
1. Implement Approach 1 (React hooks) for best results
2. Keep current implementation as fallback until new one is tested
3. Add comprehensive error handling
4. Test extensively before removing old code

The main issue is trying to manually implement UploadThing's complex upload flow instead of using their provided SDK and React hooks. The recommended Approach 1 will solve all current issues and provide a much better developer and user experience.

