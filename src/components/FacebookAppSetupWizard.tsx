import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { 
  Facebook, 
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  Settings,
  Key,
  Globe,
  Shield
} from "lucide-react";
import { toast } from "sonner";

/**
 * Facebook App Setup Wizard
 * 
 * This component guides clients through setting up their own Facebook Developer app
 * for integration with Lawncha Libre.
 */

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export function FacebookAppSetupWizard() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [appCredentials, setAppCredentials] = useState({
    appId: "",
    appSecret: "",
    redirectUri: "",
    appName: "",
  });
  const [isTesting, setIsTesting] = useState(false);

  const storeCredentials = useMutation(api.encryption.storeFacebookCredentialsAction);

  const steps: SetupStep[] = [
    {
      id: "developer-account",
      title: "Create Facebook Developer Account",
      description: "Set up your Facebook Developer account",
      completed: false
    },
    {
      id: "create-app",
      title: "Create Facebook App",
      description: "Create a new Facebook app for your business",
      completed: false
    },
    {
      id: "configure-app",
      title: "Configure App Settings",
      description: "Set up your app configuration and permissions",
      completed: false
    },
    {
      id: "get-credentials",
      title: "Get App Credentials",
      description: "Copy your App ID and App Secret",
      completed: false
    },
    {
      id: "test-connection",
      title: "Test Connection",
      description: "Verify your app works with Lawncha Libre",
      completed: false
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveCredentials = async () => {
    if (!appCredentials.appId || !appCredentials.appSecret) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsTesting(true);
      await storeCredentials({
        appId: appCredentials.appId,
        appSecret: appCredentials.appSecret,
        redirectUri: appCredentials.redirectUri,
        appName: appCredentials.appName || "Facebook App",
      });
      
      toast.success("Facebook app credentials saved successfully!");
      setCurrentStep(steps.length - 1);
    } catch (error) {
      console.error("Failed to save credentials:", error);
      toast.error("Failed to save credentials. Please check your App ID and App Secret.");
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Facebook className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Facebook Developer Account</h3>
              <p className="text-gray-600 mb-6">
                You'll need a Facebook Developer account to create an app for your business.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Go to Facebook for Developers</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Visit the Facebook for Developers website to get started.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open("https://developers.facebook.com/", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Facebook for Developers
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Click "Get Started"</h4>
                  <p className="text-sm text-gray-600">
                    Sign in with your Facebook account and complete the registration process.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Complete Developer Registration</h4>
                  <p className="text-sm text-gray-600">
                    You'll need to verify your phone number and accept Facebook's Developer Terms.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important Note</h4>
                  <p className="text-sm text-yellow-700">
                    You must use the same Facebook account that manages your business page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Settings className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Facebook App</h3>
              <p className="text-gray-600 mb-6">
                Create a new Facebook app for your landscaping business.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Click "Create App"</h4>
                  <p className="text-sm text-gray-600">
                    In your Facebook Developer Console, click the "Create App" button.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Choose "Business" App Type</h4>
                  <p className="text-sm text-gray-600">
                    Select "Business" as your app type for business management features.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Fill in App Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 mt-2">
                    <div className="space-y-2 text-sm">
                      <div><strong>App Name:</strong> [Your Business Name] Landscaping App</div>
                      <div><strong>App Contact Email:</strong> [Your business email]</div>
                      <div><strong>App Purpose:</strong> Business management and social media integration</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Configure App Settings</h3>
              <p className="text-gray-600 mb-6">
                Set up your app configuration and request necessary permissions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Go to App Settings → Basic</h4>
                  <p className="text-sm text-gray-600">
                    Add your website domain to the app settings.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <div className="text-sm">
                      <div><strong>App Domains:</strong> yourdomain.com</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Add Website Platform</h4>
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <div className="space-y-1 text-sm">
                      <div><strong>Site URL:</strong> https://yourdomain.com</div>
                      <div><strong>Privacy Policy URL:</strong> https://yourdomain.com/privacy</div>
                      <div><strong>Terms of Service URL:</strong> https://yourdomain.com/terms</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Request Permissions</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Go to App Review → Permissions and Features and request:
                  </p>
                  <div className="space-y-1">
                    <Badge variant="outline">pages_show_list</Badge>
                    <Badge variant="outline">pages_read_engagement</Badge>
                    <Badge variant="outline">pages_manage_posts</Badge>
                    <Badge variant="outline">pages_manage_metadata</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Key className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Get App Credentials</h3>
              <p className="text-gray-600 mb-6">
                Copy your App ID and App Secret from your Facebook app settings.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="appName">App Name (Optional)</Label>
                <Input
                  id="appName"
                  value={appCredentials.appName}
                  onChange={(e) => setAppCredentials(prev => ({ ...prev, appName: e.target.value }))}
                  placeholder="My Landscaping App"
                />
              </div>

              <div>
                <Label htmlFor="appId">App ID *</Label>
                <div className="flex gap-2">
                  <Input
                    id="appId"
                    value={appCredentials.appId}
                    onChange={(e) => setAppCredentials(prev => ({ ...prev, appId: e.target.value }))}
                    placeholder="1234567890123456"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(appCredentials.appId)}
                    disabled={!appCredentials.appId}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Found in App Settings → Basic
                </p>
              </div>

              <div>
                <Label htmlFor="appSecret">App Secret *</Label>
                <div className="flex gap-2">
                  <Input
                    id="appSecret"
                    type="password"
                    value={appCredentials.appSecret}
                    onChange={(e) => setAppCredentials(prev => ({ ...prev, appSecret: e.target.value }))}
                    placeholder="abcdef1234567890abcdef1234567890"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(appCredentials.appSecret)}
                    disabled={!appCredentials.appSecret}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Found in App Settings → Basic (click "Show" to reveal)
                </p>
              </div>

              <div>
                <Label htmlFor="redirectUri">Redirect URI</Label>
                <div className="flex gap-2">
                  <Input
                    id="redirectUri"
                    value={appCredentials.redirectUri}
                    onChange={(e) => setAppCredentials(prev => ({ ...prev, redirectUri: e.target.value }))}
                    placeholder="https://yourdomain.com/auth/facebook/callback"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(appCredentials.redirectUri)}
                    disabled={!appCredentials.redirectUri}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Set this in App Settings → Basic → Valid OAuth Redirect URIs
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Security Warning</h4>
                  <p className="text-sm text-red-700">
                    Keep your App Secret secure and never share it publicly. It will be encrypted and stored safely in our system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Test Connection</h3>
              <p className="text-gray-600 mb-6">
                Save your credentials and test the connection to Lawncha Libre.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Ready to Connect</h4>
                    <p className="text-sm text-green-700">
                      Your Facebook app credentials are ready to be saved and tested.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Next Steps After Saving:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Go to Social Settings to connect your Facebook page</div>
                  <div>• Test fetching your Facebook posts in Social Feed</div>
                  <div>• Try porting Facebook posts to showcase projects</div>
                  <div>• Verify projects appear on the homepage</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSaveCredentials}
                disabled={isTesting || !appCredentials.appId || !appCredentials.appSecret}
                className="flex-1"
              >
                {isTesting ? "Testing..." : "Save & Test Connection"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-6 w-6 text-blue-600" />
          Facebook App Setup Wizard
        </CardTitle>
        <CardDescription>
          Follow these steps to set up your Facebook Developer app for integration with Lawncha Libre.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${index === currentStep ? 'bg-blue-600 text-white' : 
                  index < currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="ml-2">
                <div className={`text-sm font-medium ${
                  index === currentStep ? 'text-blue-600' : 
                  index < currentStep ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="text-sm text-gray-600">
              Setup complete! Your Facebook app is ready to use.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
