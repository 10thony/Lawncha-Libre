import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Upload, X, CheckCircle, Loader2, Play, FileVideo } from "lucide-react";
import { toast } from "sonner";
import { uploadVideosWithUploadThing } from "../lib/uploadthing";

export function VideoUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file types and sizes
      const validFiles = newFiles.filter(file => {
        const isValidType = file.type.startsWith('video/');
        const isValidSize = file.size <= 32 * 1024 * 1024; // 32MB max
        
        if (!isValidType) {
          toast.error(`${file.name} is not a valid video file`);
        }
        if (!isValidSize) {
          toast.error(`${file.name} is too large. Maximum size is 32MB`);
        }
        
        return isValidType && isValidSize;
      });
      
      setFiles(prev => [...prev, ...validFiles].slice(0, 3)); // Limit to 3 videos
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one video file");
      return;
    }

    setIsUploading(true);
    try {
      const urls = await uploadVideosWithUploadThing(files);
      setUploadedUrls(urls);
      toast.success(`Successfully uploaded ${urls.length} video(s)!`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload videos. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetDemo = () => {
    setFiles([]);
    setUploadedUrls([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileVideo className="h-5 w-5" />
            Video Upload Demo
          </CardTitle>
          <CardDescription>
            Test video upload functionality with UploadThing. Supports MP4, MOV, AVI and other video formats up to 32MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Select video files to upload
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Supported formats: MP4, MOV, AVI, WebM, MKV (up to 32MB each)
            </p>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('video-upload')?.click()}
              disabled={files.length >= 3}
            >
              Choose Videos
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Max 3 videos, up to 32MB each
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Selected Videos:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Play className="h-4 w-4 text-blue-600" />
                    <div className="text-sm">
                      <div className="font-medium">{file.name}</div>
                      <div className="text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Videos
                </>
              )}
            </Button>
            {(files.length > 0 || uploadedUrls.length > 0) && (
              <Button onClick={resetDemo} variant="outline">
                Reset
              </Button>
            )}
          </div>

          {/* Upload Results */}
          {uploadedUrls.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Upload Successful!</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Uploaded Videos:</h4>
                {uploadedUrls.map((url, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium mb-2">Video {index + 1}</div>
                    <video
                      src={url}
                      controls
                      className="w-full max-w-md rounded"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="text-xs text-gray-600 mt-2 break-all">
                      URL: {url}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
