import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Facebook, 
  Instagram, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Settings,
  Link,
  Unlink
} from "lucide-react";
import { toast } from "sonner";

/**
 * Social Connections Settings Component
 * 
 * This component provides UI for managing social media connections:
 * - Clerk Facebook SSO connection status (for identity)
 * - Meta content connection (for Facebook/Instagram content access)
 * 
 * Documentation references:
 * - Clerk Facebook OAuth/SSO: https://clerk.com/docs/authentication/social-connections/facebook
 * - Meta OAuth and Access Tokens: https://developers.facebook.com/docs/facebook-login/
 */

export function SocialConnections() {
  const { user } = useUser();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Get Meta content connection status
  const metaStatus = useQuery(api.metaQueries.getMetaContentConnectionStatus);
  const connectedPages = useQuery(api.metaQueries.getConnectedPages);
  const facebookCredentials = useQuery(api.encryption.getUserFacebookCredentials);

  // Mutations
  const beginAuth = useMutation(api.metaAuth.beginFacebookContentAuth);
  const disconnect = useMutation(api.metaAuth.disconnectMetaAccount);
  const refreshToken = useMutation(api.metaContent.refreshLongLivedTokenIfNeeded);

  // Check if user has Facebook connected via Clerk (for identity)
  const clerkFacebookConnected = user?.externalAccounts?.some(
    account => account.provider === "facebook"
  ) || false;

  const handleConnectMeta = async () => {
    // Check if user has Facebook credentials configured
    if (!facebookCredentials || facebookCredentials.length === 0) {
      toast.error("Please configure your Facebook app credentials first in Social Media Management.");
      return;
    }

    const hasActiveCredentials = facebookCredentials.some(cred => cred.isActive);
    if (!hasActiveCredentials) {
      toast.error("Please activate your Facebook app credentials first.");
      return;
    }

    try {
      setIsConnecting(true);
      const { authUrl } = await beginAuth();
      
      // Open Facebook OAuth in new window
      const popup = window.open(
        authUrl,
        "facebook-auth",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      // Monitor popup for completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          // Refresh the page to update connection status
          window.location.reload();
        }
      }, 1000);

    } catch (error) {
      console.error("Failed to start Facebook auth:", error);
      if (error.message?.includes("No Facebook app credentials configured")) {
        toast.error("Please configure your Facebook app credentials first in Social Media Management.");
      } else {
        toast.error("Failed to connect Facebook. Please try again.");
      }
      setIsConnecting(false);
    }
  };

  const handleDisconnectMeta = async () => {
    try {
      setIsDisconnecting(true);
      await disconnect();
      toast.success("Facebook content connection disconnected");
      window.location.reload();
    } catch (error) {
      console.error("Failed to disconnect:", error);
      toast.error("Failed to disconnect. Please try again.");
      setIsDisconnecting(false);
    }
  };

  const handleRefreshToken = async () => {
    try {
      const result = await refreshToken();
      if (result.refreshed) {
        toast.success("Token refreshed successfully");
      } else {
        toast.info(result.reason || "Token refresh not needed");
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      toast.error("Failed to refresh token");
    }
  };

  const formatTokenExpiry = (expiresAt: number | null) => {
    if (!expiresAt) return "Never expires";
    
    const now = Date.now();
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) return "Expired";
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} left`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} left`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Social Connections</h2>
        <p className="text-gray-600 mt-1">
          Manage your social media connections for identity and content access.
        </p>
      </div>

      {/* Clerk Connections Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Clerk Connections (Identity)
          </CardTitle>
          <CardDescription>
            These connections are used for user authentication and identity verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Facebook className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Facebook</h3>
                <p className="text-sm text-gray-500">Sign in with Facebook</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {clerkFacebookConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-gray-400" />
                  <Badge variant="secondary">
                    Not Connected
                  </Badge>
                </>
              )}
            </div>
          </div>
          
          {!clerkFacebookConnected && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Facebook SSO not connected</p>
                  <p>To connect Facebook for sign-in, go to your Clerk dashboard and enable Facebook as a social provider.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Facebook App Credentials Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Facebook App Credentials
          </CardTitle>
          <CardDescription>
            Manage your Facebook app credentials for social media integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {facebookCredentials && facebookCredentials.length > 0 ? (
            <div className="space-y-3">
              {facebookCredentials.map((credential) => (
                <div key={credential._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <Instagram className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{credential.appName || "Facebook App"}</h4>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(credential.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {credential.isActive ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/dashboard?tab=social-management"}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Credentials
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">No Facebook App Credentials</p>
                  <p>You need to configure your Facebook app credentials before connecting to Facebook/Instagram.</p>
                </div>
              </div>
              <div className="mt-3">
                <Button 
                  onClick={() => window.location.href = "/dashboard?tab=social-management"}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configure Credentials
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meta Content Connection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Meta Content Connection
          </CardTitle>
          <CardDescription>
            Connect your Facebook and Instagram accounts to access and display your social media content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metaStatus?.connected ? (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-6 w-6 text-blue-600" />
                    <Instagram className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-800">Meta Content Connected</h3>
                    <p className="text-sm text-green-600">
                      Access to Facebook Pages and Instagram Business account
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
              </div>

              {/* Token Status */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Access Token Status</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshToken}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Token
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Expires: {formatTokenExpiry(metaStatus.tokenExpiresAt || null)}</p>
                  <p>Facebook User ID: {metaStatus.facebookUserId}</p>
                  {metaStatus.lastUpdated && (
                    <p>Last Updated: {new Date(metaStatus.lastUpdated).toLocaleString()}</p>
                  )}
                </div>
              </div>

              {/* Connected Pages */}
              {connectedPages && connectedPages.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Connected Facebook Pages</h4>
                  <div className="space-y-2">
                    {connectedPages.map((page) => (
                      <div key={page.pageId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Facebook className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{page.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {page.pageId}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://facebook.com/${page.pageId}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instagram Business Account */}
              {metaStatus.instagramBusinessAccountId && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Instagram Business Account</h4>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-600" />
                      <span className="font-medium">Instagram Business Account</span>
                      <Badge variant="outline" className="text-xs">
                        {metaStatus.instagramBusinessAccountId}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://instagram.com`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Disconnect Button */}
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleDisconnectMeta}
                  disabled={isDisconnecting}
                  className="flex items-center gap-2"
                >
                  <Unlink className="h-4 w-4" />
                  {isDisconnecting ? "Disconnecting..." : "Disconnect Meta Content"}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This will remove access to your Facebook and Instagram content. You can reconnect anytime.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Not Connected State */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-6 w-6 text-gray-400" />
                    <Instagram className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Meta Content Not Connected</h3>
                    <p className="text-sm text-gray-500">
                      Connect to access your Facebook Pages and Instagram content
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-gray-400" />
                  <Badge variant="secondary">
                    Not Connected
                  </Badge>
                </div>
              </div>

              {/* Connect Button */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 mb-2">Connect Meta Content</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      This will allow the app to access your Facebook Pages and Instagram Business account content.
                      You'll need to grant permissions for:
                    </p>
                    <ul className="text-sm text-blue-700 list-disc list-inside mb-4 space-y-1">
                      <li>View your Facebook Pages</li>
                      <li>Read Page posts and engagement</li>
                      <li>Access Instagram Business account media</li>
                    </ul>
                    <Button
                      onClick={handleConnectMeta}
                      disabled={isConnecting}
                      className="flex items-center gap-2"
                    >
                      <Link className="h-4 w-4" />
                      {isConnecting ? "Connecting..." : "Connect Facebook & Instagram"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
