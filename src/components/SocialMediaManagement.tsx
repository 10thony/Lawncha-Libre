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
  Instagram, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Key,
  Globe
} from "lucide-react";
import { toast } from "sonner";

/**
 * Social Media Management Component
 * 
 * This component allows users to manage their Facebook app credentials
 * for accessing Facebook Pages and Instagram Business accounts.
 * 
 * Features:
 * - Add/edit/delete Facebook app credentials
 * - Encrypted storage of sensitive data
 * - Credential validation
 * - Multiple credential sets support
 * - Security indicators and best practices
 */

interface FacebookCredential {
  _id: string;
  appName?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export function SocialMediaManagement() {
  const { user } = useUser();
  const [isAddingCredential, setIsAddingCredential] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [editingCredential, setEditingCredential] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    appName: "",
    appId: "",
    appSecret: "",
    redirectUri: "",
  });

  // Get user's Facebook credentials
  const credentials = useQuery(api.encryption.getUserFacebookCredentialsQuery, 
    user ? { userId: user.id } : "skip"
  );

  // Mutations
  const storeCredentials = useMutation(api.encryption.storeFacebookCredentials);
  const updateCredentials = useMutation(api.encryption.updateFacebookCredentials);
  const deleteCredentials = useMutation(api.encryption.deleteFacebookCredentials);
  const validateCredentials = useMutation(api.encryption.validateFacebookCredentials);

  const handleAddCredential = () => {
    setIsAddingCredential(true);
    setFormData({
      appName: "",
      appId: "",
      appSecret: "",
      redirectUri: "",
    });
  };

  const handleEditCredential = (credentialId: string) => {
    setEditingCredential(credentialId);
    // Note: We can't decrypt existing credentials for security reasons
    // User will need to re-enter the values
    setFormData({
      appName: "",
      appId: "",
      appSecret: "",
      redirectUri: "",
    });
  };

  const handleCancel = () => {
    setIsAddingCredential(false);
    setEditingCredential(null);
    setFormData({
      appName: "",
      appId: "",
      appSecret: "",
      redirectUri: "",
    });
  };

  const handleValidateCredentials = async () => {
    if (!formData.appId || !formData.appSecret || !formData.redirectUri) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateCredentials({
        appId: formData.appId,
        appSecret: formData.appSecret,
        redirectUri: formData.redirectUri,
      });

      if (result.valid) {
        toast.success("Credentials are valid!");
      } else {
        toast.error(`Invalid credentials: ${result.error}`);
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate credentials");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!formData.appId || !formData.appSecret || !formData.redirectUri) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingCredential) {
        await updateCredentials({
          credentialId: editingCredential as any,
          userId: user!.id,
          appId: formData.appId,
          appSecret: formData.appSecret,
          redirectUri: formData.redirectUri,
          appName: formData.appName || "Facebook App",
        });
        toast.success("Credentials updated successfully");
      } else {
        await storeCredentials({
          userId: user!.id,
          appId: formData.appId,
          appSecret: formData.appSecret,
          redirectUri: formData.redirectUri,
          appName: formData.appName || "Facebook App",
        });
        toast.success("Credentials saved successfully");
      }

      handleCancel();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save credentials");
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    if (!confirm("Are you sure you want to delete these credentials? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteCredentials({ credentialId: credentialId as any });
      toast.success("Credentials deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete credentials");
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Social Media Management</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your Facebook app credentials for accessing Facebook Pages and Instagram Business accounts.
        </p>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Security Notice</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your Facebook app credentials are encrypted using AES-256-GCM encryption and stored securely. 
                Only you can decrypt and use these credentials. We never store your credentials in plain text.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Credentials */}
      {credentials && credentials.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Your Facebook App Credentials</h3>
            <Button onClick={handleAddCredential} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Credentials
            </Button>
          </div>

          <div className="grid gap-4">
            {credentials.map((credential) => (
              <Card key={credential._id} className={credential.isActive ? "border-green-200 bg-green-50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Facebook className="h-5 w-5 text-blue-600" />
                        <Instagram className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{credential.appName || "Facebook App"}</h4>
                        <p className="text-sm text-gray-500">
                          Created: {formatDate(credential.createdAt)}
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
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCredential(credential._id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCredential(credential._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Credentials Form */}
      {(isAddingCredential || editingCredential) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {editingCredential ? "Edit Facebook App Credentials" : "Add Facebook App Credentials"}
            </CardTitle>
            <CardDescription>
              Enter your Facebook app credentials to enable social media integration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name (Optional)</Label>
                <Input
                  id="appName"
                  placeholder="My Facebook App"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appId">Facebook App ID *</Label>
                <Input
                  id="appId"
                  placeholder="123456789012345"
                  value={formData.appId}
                  onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appSecret">Facebook App Secret *</Label>
              <div className="relative">
                <Input
                  id="appSecret"
                  type={showSecrets.appSecret ? "text" : "password"}
                  placeholder="Enter your Facebook App Secret"
                  value={formData.appSecret}
                  onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowSecrets({ ...showSecrets, appSecret: !showSecrets.appSecret })}
                >
                  {showSecrets.appSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirectUri">Redirect URI *</Label>
              <Input
                id="redirectUri"
                placeholder="https://yourdomain.com/api/auth/facebook/callback"
                value={formData.redirectUri}
                onChange={(e) => setFormData({ ...formData, redirectUri: e.target.value })}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This should match the redirect URI configured in your Facebook app settings.
              </p>
            </div>

            {/* Help Text */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-1">How to get your Facebook App credentials:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Facebook Developers</a></li>
                    <li>Create a new app or select an existing one</li>
                    <li>Go to Settings → Basic to find your App ID and App Secret</li>
                    <li>Add your redirect URI to Valid OAuth Redirect URIs</li>
                    <li>Copy the credentials to this form</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={handleValidateCredentials}
                disabled={isValidating || !formData.appId || !formData.appSecret || !formData.redirectUri}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isValidating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Validate Credentials
              </Button>
              
              <Button
                onClick={handleSaveCredentials}
                disabled={!formData.appId || !formData.appSecret || !formData.redirectUri}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Save Credentials
              </Button>
              
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Credentials Button (when no credentials exist) */}
      {(!credentials || credentials.length === 0) && !isAddingCredential && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Facebook className="h-8 w-8 text-gray-400" />
              <Instagram className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Facebook App Credentials
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add your Facebook app credentials to enable social media integration.
            </p>
            <Button onClick={handleAddCredential} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Facebook App Credentials
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800 dark:text-green-200">✅ Do</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Use HTTPS for redirect URIs in production</li>
                <li>• Keep your App Secret secure and never share it</li>
                <li>• Use Test Users during development</li>
                <li>• Regularly rotate your App Secret</li>
                <li>• Monitor your app's API usage</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-red-800 dark:text-red-200">❌ Don't</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Share your App Secret in code or logs</li>
                <li>• Use HTTP redirect URIs in production</li>
                <li>• Grant unnecessary permissions</li>
                <li>• Ignore Facebook's rate limits</li>
                <li>• Store credentials in plain text</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
