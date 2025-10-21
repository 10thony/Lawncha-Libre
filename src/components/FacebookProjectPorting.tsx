import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Facebook, 
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Upload,
  BarChart3,
  Settings,
  Globe,
  Lock
} from "lucide-react";
import { toast } from "sonner";

/**
 * Facebook Project Porting Component
 * 
 * This component allows business owners to:
 * - View unported Facebook posts
 * - Port Facebook posts to showcase projects
 * - Manage showcase project visibility
 * - View porting statistics
 */

interface FacebookPost {
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

interface ShowcaseProject {
  _id: string;
  projectName: string;
  projectType: string;
  projectDescription?: string;
  isPublicShowcase?: boolean;
  facebookPostUrl?: string;
  imageUrls?: string[];
  actualEndDateTime: number;
  businessProfile?: {
    businessName: string;
    businessType: string;
  };
}

export function FacebookProjectPorting() {
  const { user } = useUser();
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showPortingForm, setShowPortingForm] = useState(false);
  const [portingData, setPortingData] = useState<{
    projectName: string;
    projectType: string;
    projectDescription: string;
    isPublicShowcase: boolean;
  }>({
    projectName: "",
    projectType: "",
    projectDescription: "",
    isPublicShowcase: true,
  });

  // Queries
  const unportedPosts = useQuery(api.facebookProjectPort.getUnportedFacebookPosts);
  const showcaseProjects = useQuery(api.facebookProjectPort.getShowcaseProjects, { limit: 50 });
  const stats = useQuery(api.facebookProjectPort.getProjectPortStats);

  // Mutations
  const portPost = useMutation(api.facebookProjectPort.portFacebookPostToProject);
  const bulkPort = useMutation(api.facebookProjectPort.bulkPortFacebookPostsToProjects);
  const updateShowcaseStatus = useMutation(api.facebookProjectPort.updateProjectShowcaseStatus);

  const handleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPosts.size === unportedPosts?.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(unportedPosts?.map(p => p.id) || []));
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
      const postsToPort = Array.from(selectedPosts).map(postId => {
        const post = unportedPosts?.find(p => p.id === postId);
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
      setShowPortingForm(false);
      setPortingData({
        projectName: "",
        projectType: "",
        projectDescription: "",
        isPublicShowcase: true,
      });
    } catch (error) {
      console.error("Failed to port posts:", error);
      toast.error("Failed to port posts");
    }
  };

  const handleToggleShowcase = async (projectId: string, currentStatus: boolean) => {
    try {
      await updateShowcaseStatus({
        projectId: projectId as any,
        isPublicShowcase: !currentStatus,
      });
      toast.success("Showcase status updated");
    } catch (error) {
      console.error("Failed to update showcase status:", error);
      toast.error("Failed to update showcase status");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facebook Project Porting</CardTitle>
          <CardDescription>Please sign in to manage Facebook post porting</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Porting Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalFacebookPosts}</div>
                <div className="text-sm text-gray-600">Total Facebook Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.portedProjects}</div>
                <div className="text-sm text-gray-600">Ported Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.showcaseProjects}</div>
                <div className="text-sm text-gray-600">Showcase Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.unportedPosts}</div>
                <div className="text-sm text-gray-600">Unported Posts</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Loading statistics...</div>
          )}
        </CardContent>
      </Card>

      {/* Unported Facebook Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5" />
            Unported Facebook Posts
          </CardTitle>
          <CardDescription>
            Select Facebook posts to port them as showcase projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unportedPosts && unportedPosts.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  className="text-sm"
                >
                  {selectedPosts.size === unportedPosts.length ? "Deselect All" : "Select All"}
                </Button>
                <Button
                  onClick={() => setShowPortingForm(true)}
                  disabled={selectedPosts.size === 0}
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Port Selected ({selectedPosts.size})
                </Button>
              </div>

              <div className="grid gap-4">
                {unportedPosts.map((post) => (
                  <Card key={post.id} className="p-4">
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
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No unported Facebook posts found. Fetch some Facebook posts first!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Porting Form Modal */}
      {showPortingForm && (
        <Card>
          <CardHeader>
            <CardTitle>Port Selected Posts to Projects</CardTitle>
            <CardDescription>
              Configure how the selected Facebook posts will be converted to showcase projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectName">Project Name Base</Label>
                <Input
                  id="projectName"
                  value={portingData.projectName}
                  onChange={(e) => setPortingData(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="e.g., Landscaping Project"
                />
              </div>
              <div>
                <Label htmlFor="projectType">Project Type</Label>
                <Input
                  id="projectType"
                  value={portingData.projectType}
                  onChange={(e) => setPortingData(prev => ({ ...prev, projectType: e.target.value }))}
                  placeholder="e.g., Landscaping, Lawn Care"
                />
              </div>
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
              <Button onClick={handlePortSelected}>
                <Upload className="h-4 w-4 mr-2" />
                Port {selectedPosts.size} Posts
              </Button>
              <Button variant="outline" onClick={() => setShowPortingForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Showcase Projects Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Showcase Projects
          </CardTitle>
          <CardDescription>
            Control which projects are visible on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showcaseProjects && showcaseProjects.length > 0 ? (
            <div className="space-y-4">
              {showcaseProjects.map((project) => (
                <Card key={project._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{project.projectName}</h3>
                        <Badge variant={project.isPublicShowcase ? "default" : "secondary"}>
                          {project.projectType}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {project.projectDescription || "No description"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Completed: {formatDate(project.actualEndDateTime)}</span>
                        {project.facebookPostUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(project.facebookPostUrl, "_blank")}
                            className="text-xs h-6 px-2"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Original Post
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.isPublicShowcase ? "default" : "outline"}>
                        {project.isPublicShowcase ? (
                          <>
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </>
                        )}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleShowcase(project._id, project.isPublicShowcase || false)}
                      >
                        {project.isPublicShowcase ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Show
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No showcase projects found. Port some Facebook posts first!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
