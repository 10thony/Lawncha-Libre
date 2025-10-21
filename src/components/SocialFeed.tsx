import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  Instagram, 
  Facebook, 
  ExternalLink,
  RefreshCw,
  Calendar,
  MessageCircle,
  Image,
  Video,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Plus,
  Globe,
  Upload,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

/**
 * Social Feed Component
 * 
 * This component displays Instagram and Facebook content in a tabbed interface
 * with pagination and refresh capabilities.
 * 
 * Documentation references:
 * - Instagram Graph API: https://developers.facebook.com/docs/instagram-api/
 * - Facebook Graph API: https://developers.facebook.com/docs/graph-api/
 */

interface MediaItem {
  _id: string;
  id: string;
  caption?: string;
  mediaType: string;
  mediaUrl: string;
  permalink: string;
  timestamp: number;
  children?: Array<{
    mediaType: string;
    mediaUrl: string;
  }>;
}

interface PostItem {
  _id: string;
  id: string;
  message?: string;
  permalinkUrl: string;
  createdTime: number;
  attachments?: Array<{
    mediaType: string;
    mediaUrl: string;
  }>;
}

export function SocialFeed() {
  const [activeTab, setActiveTab] = useState<"instagram" | "facebook">("instagram");
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showPortingDialog, setShowPortingDialog] = useState(false);
  const [portingData, setPortingData] = useState({
    projectName: "",
    projectType: "",
    projectDescription: "",
    isPublicShowcase: true,
  });

  // Get Meta connection status and pages
  const metaStatus = useQuery(api.metaQueries.getMetaContentConnectionStatus);
  const connectedPages = useQuery(api.metaQueries.getConnectedPages);

  // Get content data
  const instagramMedia = useQuery(api.metaQueries.listInstagramMedia, { limit: 20 });
  const facebookPosts = useQuery(api.metaQueries.listFacebookPosts, { 
    pageId: selectedPageId || undefined,
    limit: 20 
  });

  // Mutations
  const fetchInstagramMedia = useMutation(api.metaContent.fetchInstagramMedia);
  const fetchFacebookPosts = useMutation(api.metaContent.fetchFacebookPosts);
  const bulkPort = useMutation(api.facebookProjectPort.bulkPortFacebookPostsToProjects);

  // Set default page when pages are loaded
  useEffect(() => {
    if (connectedPages && connectedPages.length > 0 && !selectedPageId) {
      setSelectedPageId(connectedPages[0].pageId);
    }
  }, [connectedPages, selectedPageId]);

  const handleRefreshInstagram = async () => {
    try {
      setIsLoading(true);
      await fetchInstagramMedia({ limit: 20 });
      toast.success("Instagram content refreshed");
    } catch (error) {
      console.error("Failed to refresh Instagram:", error);
      toast.error("Failed to refresh Instagram content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshFacebook = async () => {
    if (!selectedPageId) return;
    
    try {
      setIsLoading(true);
      await fetchFacebookPosts({ pageId: selectedPageId, limit: 20 });
      toast.success("Facebook content refreshed");
    } catch (error) {
      console.error("Failed to refresh Facebook:", error);
      toast.error("Failed to refresh Facebook content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleSelectAllFacebook = () => {
    if (!facebookPosts) return;
    
    if (selectedPosts.size === facebookPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(facebookPosts.map(p => p.id)));
    }
  };

  const handlePortSelected = async () => {
    if (selectedPosts.size === 0) {
      toast.error("Please select at least one post to port");
      return;
    }

    if (!portingData.projectName || !portingData.projectType) {
      toast.error("Please fill in project name and type");
      return;
    }

    try {
      setIsLoading(true);
      const postsToPort = Array.from(selectedPosts).map(postId => {
        const post = facebookPosts?.find(p => p.id === postId);
        return {
          facebookPostId: postId,
          projectName: `${portingData.projectName} - ${post?.message?.substring(0, 30) || "Post"}`,
          projectType: portingData.projectType,
          projectDescription: portingData.projectDescription || post?.message,
          isPublicShowcase: portingData.isPublicShowcase,
        };
      });

      const results = await bulkPort({ posts: postsToPort });
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast.success(`Successfully ported ${successCount} posts to projects`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to port ${errorCount} posts`);
      }

      setSelectedPosts(new Set());
      setShowPortingDialog(false);
      setPortingData({
        projectName: "",
        projectType: "",
        projectDescription: "",
        isPublicShowcase: true,
      });
    } catch (error) {
      console.error("Failed to port posts:", error);
      toast.error("Failed to port posts");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType.toLowerCase()) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "carousel_album":
        return <Image className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  const renderInstagramMedia = (media: MediaItem) => (
    <Card key={media._id} className="overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={media.mediaUrl}
          alt={media.caption || "Instagram post"}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-black/50 text-white">
            {getMediaIcon(media.mediaType)}
            <span className="ml-1 capitalize">{media.mediaType.toLowerCase()}</span>
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        {media.caption && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
            {media.caption}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(media.timestamp)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(media.permalink, "_blank")}
            className="h-6 px-2"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFacebookPost = (post: PostItem) => (
    <Card key={post._id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Facebook className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Facebook Post</span>
              <Badge variant="outline" className="text-xs">
                {post.id}
              </Badge>
            </div>
            
            {post.message && (
              <p className="text-gray-700 mb-3">{post.message}</p>
            )}
            
            {post.attachments && post.attachments.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {post.attachments.slice(0, 4).map((attachment, index) => (
                  <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                    <img
                      src={attachment.mediaUrl}
                      alt={`Post attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1">
                      <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                        {getMediaIcon(attachment.mediaType)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(post.createdTime)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(post.permalinkUrl, "_blank")}
                className="h-6 px-2"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!metaStatus?.connected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Feed</h2>
          <p className="text-gray-600 mt-1">
            View your Instagram and Facebook content in one place.
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Instagram className="h-8 w-8 text-gray-400" />
              <Facebook className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect Your Social Media
            </h3>
            <p className="text-gray-600 mb-4">
              Connect your Facebook and Instagram accounts to view your social media content here.
            </p>
            <Button onClick={() => window.location.href = "/dashboard?tab=social-settings"}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Feed</h2>
          <p className="text-gray-600 mt-1">
            View your Instagram and Facebook content in one place.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === "instagram" ? (
            <Button
              variant="outline"
              onClick={handleRefreshInstagram}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Instagram
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleRefreshFacebook}
              disabled={isLoading || !selectedPageId}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Facebook
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("instagram")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "instagram"
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Instagram className="h-4 w-4" />
            Instagram
            {instagramMedia?.media && (
              <Badge variant="secondary" className="ml-1">
                {instagramMedia.media.length}
              </Badge>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("facebook")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "facebook"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Facebook className="h-4 w-4" />
            Facebook
            {facebookPosts?.posts && (
              <Badge variant="secondary" className="ml-1">
                {facebookPosts.posts.length}
              </Badge>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "instagram" && (
          <div className="space-y-4">
            {!metaStatus.instagramBusinessAccountId ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Instagram Business Account
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your Instagram account must be linked to a Facebook Page to display content here.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>Instagram Business/Creator account required</span>
                  </div>
                </CardContent>
              </Card>
            ) : instagramMedia?.media && instagramMedia.media.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instagramMedia.media.map(renderInstagramMedia)}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Instagram Content
                  </h3>
                  <p className="text-gray-600">
                    No Instagram posts found. Try refreshing or check your Instagram account.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "facebook" && (
          <div className="space-y-4">
            {/* Page Selector */}
            {connectedPages && connectedPages.length > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Page:</span>
                    <select
                      value={selectedPageId}
                      onChange={(e) => setSelectedPageId(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      {connectedPages.map((page) => (
                        <option key={page.pageId} value={page.pageId}>
                          {page.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Porting Controls */}
            {facebookPosts?.posts && facebookPosts.posts.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllFacebook}
                      >
                        {selectedPosts.size === facebookPosts.posts.length ? "Deselect All" : "Select All"}
                      </Button>
                      <span className="text-sm text-gray-600">
                        {selectedPosts.size} of {facebookPosts.posts.length} posts selected
                      </span>
                    </div>
                    
                    <Dialog open={showPortingDialog} onOpenChange={setShowPortingDialog}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={selectedPosts.size === 0}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Port Selected ({selectedPosts.size})
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Port Posts to Projects</DialogTitle>
                          <DialogDescription>
                            Convert selected Facebook posts into showcase projects for your homepage.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="projectName">Project Name Base *</Label>
                            <Input
                              id="projectName"
                              value={portingData.projectName}
                              onChange={(e) => setPortingData(prev => ({ ...prev, projectName: e.target.value }))}
                              placeholder="e.g., Landscaping Project"
                            />
                          </div>
                          <div>
                            <Label htmlFor="projectType">Project Type *</Label>
                            <Input
                              id="projectType"
                              value={portingData.projectType}
                              onChange={(e) => setPortingData(prev => ({ ...prev, projectType: e.target.value }))}
                              placeholder="e.g., Landscaping, Lawn Care"
                            />
                          </div>
                          <div>
                            <Label htmlFor="projectDescription">Default Description</Label>
                            <Textarea
                              id="projectDescription"
                              value={portingData.projectDescription}
                              onChange={(e) => setPortingData(prev => ({ ...prev, projectDescription: e.target.value }))}
                              placeholder="Optional default description for projects"
                              rows={3}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isPublicShowcase"
                              checked={portingData.isPublicShowcase}
                              onChange={(e) => setPortingData(prev => ({ ...prev, isPublicShowcase: e.target.checked }))}
                            />
                            <Label htmlFor="isPublicShowcase">
                              Make projects visible on homepage showcase
                            </Label>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handlePortSelected}
                              disabled={isLoading || !portingData.projectName || !portingData.projectType}
                              className="flex-1"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Porting...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Port {selectedPosts.size} Posts
                                </>
                              )}
                            </Button>
                            <Button variant="outline" onClick={() => setShowPortingDialog(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {facebookPosts?.posts && facebookPosts.posts.length > 0 ? (
              <div className="space-y-4">
                {facebookPosts.posts.map((post) => (
                  <Card key={post.id} className={`${selectedPosts.has(post.id) ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedPosts.has(post.id)}
                          onChange={() => handleSelectPost(post.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">
                              {formatDate(post.createdTime)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(post.permalinkUrl, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {post.message || "No message"}
                          </p>
                          {post.attachments && post.attachments.length > 0 && (
                            <div className="flex gap-2">
                              {post.attachments.slice(0, 3).map((attachment, index) => (
                                <img
                                  key={index}
                                  src={attachment.mediaUrl}
                                  alt={`Attachment ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              ))}
                              {post.attachments.length > 3 && (
                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs">
                                  +{post.attachments.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Facebook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Facebook Posts
                  </h3>
                  <p className="text-gray-600">
                    No Facebook posts found for the selected page. Try refreshing or check your Facebook Page.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
