import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  Facebook, 
  ExternalLink,
  Settings,
  Eye,
  RefreshCw,
  AlertCircle,
  Info,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";
import { toast } from "sonner";

/**
 * Facebook Page Plugin Component
 * 
 * This component provides an alternative to the Graph API by using Facebook's
 * official Page Plugin. It's useful when clients can't set up their own apps.
 */

interface FacebookPagePluginProps {
  pageUrl?: string;
  width?: number;
  height?: number;
  showHeader?: boolean;
  showTabs?: string[];
  className?: string;
}

interface PluginConfig {
  pageUrl: string;
  width: number;
  height: number;
  showHeader: boolean;
  showTabs: string[];
  adaptContainerWidth: boolean;
  hideCover: boolean;
  showFacepile: boolean;
}

export function FacebookPagePlugin({
  pageUrl,
  width = 340,
  height = 500,
  showHeader = true,
  showTabs = ["timeline", "events", "messages"],
  className = ""
}: FacebookPagePluginProps) {
  const { user } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Load Facebook SDK
  useEffect(() => {
    const loadFacebookSDK = () => {
      if (window.FB) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        if (window.FB) {
          window.FB.init({
            xfbml: true,
            version: 'v19.0'
          });
          setIsLoaded(true);
        }
      };

      script.onerror = () => {
        setHasError(true);
        console.error('Failed to load Facebook SDK');
      };

      document.head.appendChild(script);
    };

    loadFacebookSDK();
  }, []);

  // Parse Facebook page URL to get page ID or handle
  const parsePageUrl = (url: string) => {
    try {
      // Handle different Facebook URL formats
      const patterns = [
        /facebook\.com\/([^\/\?]+)/,
        /fb\.com\/([^\/\?]+)/,
        /facebook\.com\/pages\/[^\/]+\/(\d+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing Facebook page URL:', error);
      return null;
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setIsLoaded(false);
    
    // Remove existing script and reload
    const existingScript = document.querySelector('script[src*="connect.facebook.net"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Reload the component
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!pageUrl) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Facebook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No Facebook page configured</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load Facebook plugin</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pageId = parsePageUrl(pageUrl);

  if (!pageId) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-yellow-600 mb-2">Invalid Facebook page URL</p>
            <p className="text-sm text-gray-500">Please check the page URL format</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {!isLoaded && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading Facebook plugin...</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div 
        className="fb-page" 
        data-href={pageUrl}
        data-width={width}
        data-height={height}
        data-tabs={showTabs.join(',')}
        data-small-header={!showHeader}
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="true"
        data-lazy="true"
        style={{ display: isLoaded ? 'block' : 'none' }}
      />
    </div>
  );
}

/**
 * Facebook Page Plugin Configuration Component
 * 
 * This component allows clients to configure their Facebook page plugin settings
 */
export function FacebookPagePluginConfig() {
  const { user } = useUser();
  const [config, setConfig] = useState<PluginConfig>({
    pageUrl: "",
    width: 340,
    height: 500,
    showHeader: true,
    showTabs: ["timeline", "events", "messages"],
    adaptContainerWidth: true,
    hideCover: false,
    showFacepile: true,
  });
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const handleSaveConfig = () => {
    // Save configuration to database
    // This would integrate with your backend
    toast.success("Facebook page plugin configuration saved!");
  };

  const validatePageUrl = (url: string) => {
    const patterns = [
      /^https:\/\/www\.facebook\.com\/[^\/\?]+$/,
      /^https:\/\/facebook\.com\/[^\/\?]+$/,
      /^https:\/\/fb\.com\/[^\/\?]+$/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  const availableTabs = [
    { id: "timeline", label: "Timeline" },
    { id: "events", label: "Events" },
    { id: "messages", label: "Messages" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-6 w-6 text-blue-600" />
            Facebook Page Plugin Configuration
          </CardTitle>
          <CardDescription>
            Configure how your Facebook page appears on the website. This is an alternative to the Graph API integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Page URL Configuration */}
          <div>
            <Label htmlFor="pageUrl">Facebook Page URL *</Label>
            <Input
              id="pageUrl"
              value={config.pageUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, pageUrl: e.target.value }))}
              placeholder="https://www.facebook.com/yourbusinesspage"
              className="mt-1"
            />
            {config.pageUrl && !validatePageUrl(config.pageUrl) && (
              <p className="text-sm text-red-600 mt-1">
                Please enter a valid Facebook page URL
              </p>
            )}
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                value={config.width}
                onChange={(e) => setConfig(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                min="180"
                max="500"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                value={config.height}
                onChange={(e) => setConfig(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                min="70"
                max="1000"
                className="mt-1"
              />
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Display Options</h4>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showHeader"
                checked={config.showHeader}
                onChange={(e) => setConfig(prev => ({ ...prev, showHeader: e.target.checked }))}
              />
              <Label htmlFor="showHeader">Show page header</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hideCover"
                checked={config.hideCover}
                onChange={(e) => setConfig(prev => ({ ...prev, hideCover: e.target.checked }))}
              />
              <Label htmlFor="hideCover">Hide cover photo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showFacepile"
                checked={config.showFacepile}
                onChange={(e) => setConfig(prev => ({ ...prev, showFacepile: e.target.checked }))}
              />
              <Label htmlFor="showFacepile">Show facepile</Label>
            </div>
          </div>

          {/* Tabs Configuration */}
          <div>
            <Label>Tabs to Display</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableTabs.map((tab) => (
                <div key={tab.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={tab.id}
                    checked={config.showTabs.includes(tab.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig(prev => ({ 
                          ...prev, 
                          showTabs: [...prev.showTabs, tab.id] 
                        }));
                      } else {
                        setConfig(prev => ({ 
                          ...prev, 
                          showTabs: prev.showTabs.filter(t => t !== tab.id) 
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={tab.id} className="text-sm">{tab.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Mode Toggle */}
          <div>
            <Label>Preview Mode</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={previewMode === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>
          </div>

          {/* Preview */}
          {config.pageUrl && validatePageUrl(config.pageUrl) && (
            <div>
              <Label>Preview</Label>
              <div className={`
                mt-2 border rounded-lg p-4
                ${previewMode === "mobile" ? "max-w-sm" : "max-w-md"}
              `}>
                <FacebookPagePlugin
                  pageUrl={config.pageUrl}
                  width={previewMode === "mobile" ? 280 : config.width}
                  height={config.height}
                  showHeader={config.showHeader}
                  showTabs={config.showTabs}
                />
              </div>
            </div>
          )}

          {/* Limitations Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Plugin Limitations</h4>
                <div className="text-sm text-yellow-700 space-y-1 mt-1">
                  <p>• Only shows public posts and events</p>
                  <p>• Cannot access post data programmatically</p>
                  <p>• Limited customization options</p>
                  <p>• Cannot integrate with project porting system</p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSaveConfig}
            disabled={!config.pageUrl || !validatePageUrl(config.pageUrl)}
            className="w-full"
          >
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Extend window interface for Facebook SDK
declare global {
  interface Window {
    FB: any;
  }
}
