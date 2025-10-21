import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Facebook, 
  Instagram,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  BarChart3,
  Globe,
  Lock,
  Zap,
  Users
} from "lucide-react";

// Import the existing components
import { FacebookAppSetupWizard } from "./FacebookAppSetupWizard";
import { FacebookPagePluginConfig } from "./FacebookPagePlugin";
import { FacebookProjectPorting } from "./FacebookProjectPorting";
import { SocialConnections } from "./SocialConnections";
import { SocialMediaManagement } from "./SocialMediaManagement";

/**
 * Unified Facebook Integration Hub
 * 
 * This component provides a single interface for all Facebook integration features:
 * - Setup wizard for Facebook apps
 * - Page plugin configuration
 * - Project porting functionality
 * - Social media management
 * - Connection status and analytics
 */

export function FacebookIntegrationHub() {
  const { user } = useUser();
  const [activeSubTab, setActiveSubTab] = useState("overview");

  // Get integration status and statistics
  const metaStatus = useQuery(api.metaQueries.getMetaContentConnectionStatus);
  const facebookCredentials = useQuery(
    api.encryption.getUserFacebookCredentialsQuery,
    user?.id ? { userId: user.id } : "skip"
  );
  const portStats = useQuery(api.facebookProjectPort.getProjectPortStats);

  // Determine integration status
  const hasFacebookCredentials = facebookCredentials && facebookCredentials.length > 0;
  const hasActiveCredentials = facebookCredentials?.some(cred => cred.isActive);
  const isConnected = metaStatus?.isConnected || false;

  const getIntegrationStatus = () => {
    if (!hasFacebookCredentials) {
      return {
        status: "not-configured",
        label: "Not Configured",
        color: "gray",
        description: "No Facebook app credentials set up"
      };
    }
    
    if (!hasActiveCredentials) {
      return {
        status: "inactive",
        label: "Inactive",
        color: "yellow",
        description: "Facebook app credentials not active"
      };
    }
    
    if (!isConnected) {
      return {
        status: "not-connected",
        label: "Not Connected",
        color: "orange",
        description: "Facebook page not connected"
      };
    }
    
    return {
      status: "connected",
      label: "Connected",
      color: "green",
      description: "Facebook integration fully operational"
    };
  };

  const integrationStatus = getIntegrationStatus();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-6 w-6 text-blue-600" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                w-3 h-3 rounded-full
                ${integrationStatus.color === 'green' ? 'bg-green-500' :
                  integrationStatus.color === 'yellow' ? 'bg-yellow-500' :
                  integrationStatus.color === 'orange' ? 'bg-orange-500' :
                  'bg-gray-500'}
              `} />
              <div>
                <h3 className="font-semibold">{integrationStatus.label}</h3>
                <p className="text-sm text-gray-600">{integrationStatus.description}</p>
              </div>
            </div>
            <Badge 
              variant={integrationStatus.color === 'green' ? 'default' : 'secondary'}
              className={`
                ${integrationStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                  integrationStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  integrationStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'}
              `}
            >
              {integrationStatus.label}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!hasFacebookCredentials && (
              <Button 
                onClick={() => setActiveSubTab("setup")}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Zap className="h-6 w-6" />
                <span>Setup Facebook App</span>
                <span className="text-xs opacity-80">Get started with Facebook integration</span>
              </Button>
            )}
            
            {hasFacebookCredentials && !isConnected && (
              <Button 
                onClick={() => setActiveSubTab("connections")}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <Users className="h-6 w-6" />
                <span>Connect Facebook Page</span>
                <span className="text-xs opacity-80">Link your Facebook page</span>
              </Button>
            )}
            
            {isConnected && (
              <Button 
                onClick={() => setActiveSubTab("porting")}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <Globe className="h-6 w-6" />
                <span>Port Projects</span>
                <span className="text-xs opacity-80">Convert posts to showcase projects</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {portStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Integration Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{portStats.totalFacebookPosts}</div>
                <div className="text-sm text-gray-600">Facebook Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{portStats.portedProjects}</div>
                <div className="text-sm text-gray-600">Ported Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{portStats.showcaseProjects}</div>
                <div className="text-sm text-gray-600">Showcase Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{portStats.unportedPosts}</div>
                <div className="text-sm text-gray-600">Available to Port</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Methods</CardTitle>
          <CardDescription>
            Choose the best integration method for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graph API Method */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Facebook className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Graph API Integration</h3>
                <Badge variant="default" className="ml-auto">Recommended</Badge>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Full access to Facebook posts and data
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Automatic project porting functionality
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Real-time content synchronization
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Complete project showcase integration
                </div>
              </div>
              <Button 
                onClick={() => setActiveSubTab("setup")}
                className="w-full"
                variant={hasFacebookCredentials ? "outline" : "default"}
              >
                {hasFacebookCredentials ? "Manage Graph API" : "Setup Graph API"}
              </Button>
            </div>

            {/* Page Plugin Method */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Page Plugin</h3>
                <Badge variant="secondary">Fallback</Badge>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No app review required
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Limited to public posts only
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  No programmatic data access
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Cannot port to projects
                </div>
              </div>
              <Button 
                onClick={() => setActiveSubTab("plugin")}
                variant="outline"
                className="w-full"
              >
                Setup Page Plugin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to set up Facebook integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${hasFacebookCredentials ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {hasFacebookCredentials ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Set up Facebook Developer App</h4>
                <p className="text-sm text-gray-600">
                  Create your Facebook Developer account and app for full integration features.
                </p>
                {!hasFacebookCredentials && (
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setActiveSubTab("setup")}
                  >
                    Start Setup
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${isConnected ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {isConnected ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Connect Your Facebook Page</h4>
                <p className="text-sm text-gray-600">
                  Link your business Facebook page to enable content access.
                </p>
                {hasFacebookCredentials && !isConnected && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="mt-2"
                    onClick={() => setActiveSubTab("connections")}
                  >
                    Connect Page
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${portStats?.showcaseProjects > 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {portStats?.showcaseProjects > 0 ? <CheckCircle className="h-4 w-4" /> : '3'}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Port Posts to Projects</h4>
                <p className="text-sm text-gray-600">
                  Convert your Facebook posts into showcase projects for your homepage.
                </p>
                {isConnected && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="mt-2"
                    onClick={() => setActiveSubTab("porting")}
                  >
                    Port Posts
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facebook Integration</h1>
          <p className="text-gray-600 mt-1">
            Connect your Facebook page and showcase your work on your website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={integrationStatus.color === 'green' ? 'default' : 'secondary'}
            className={`
              ${integrationStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                integrationStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                integrationStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'}
            `}
          >
            {integrationStatus.label}
          </Badge>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="porting">Porting</TabsTrigger>
          <TabsTrigger value="plugin">Plugin</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="setup" className="mt-6">
          <FacebookAppSetupWizard />
        </TabsContent>

        <TabsContent value="connections" className="mt-6">
          <SocialConnections />
        </TabsContent>

        <TabsContent value="management" className="mt-6">
          <SocialMediaManagement />
        </TabsContent>

        <TabsContent value="porting" className="mt-6">
          <FacebookProjectPorting />
        </TabsContent>

        <TabsContent value="plugin" className="mt-6">
          <FacebookPagePluginConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
