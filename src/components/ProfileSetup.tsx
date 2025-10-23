import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { EmployeeRegistration } from "./EmployeeRegistration";
import { ThemeToggle } from "./ui/theme-toggle";
import { SignOutButton } from "../SignOutButton";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { 
  Home, 
  Building2, 
  Users, 
  ArrowLeft,
  Plus,
  X
} from "lucide-react";

export function ProfileSetup() {
  const [userType, setUserType] = useState<"client" | "business" | "employee" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    businessDescription: "",
    phone: "",
    address: "",
    services: [] as string[],
  });
  const [serviceInput, setServiceInput] = useState("");

  const createProfile = useMutation(api.profiles.createProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) return;

    try {
      await createProfile({
        name: formData.name,
        userType,
        ...(userType === "business" ? {
          businessName: formData.businessName,
          businessDescription: formData.businessDescription,
          phone: formData.phone,
          address: formData.address,
          services: formData.services,
        } : {
          phone: formData.phone,
          address: formData.address,
        }),
      });
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
    }
  };

  const addService = () => {
    if (serviceInput.trim() && !formData.services.includes(serviceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, serviceInput.trim()]
      }));
      setServiceInput("");
    }
  };

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold gradient-text">Lawncha Libre</h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Complete Your Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Let's get you set up with the right experience
          </p>
        </div>

        {!userType ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100">
              What type of user are you?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary dark:hover:border-primary"
                onClick={() => setUserType("client")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Home className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">I'm a Client</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    I'm looking for landscaping services for my property
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary dark:hover:border-primary"
                onClick={() => setUserType("business")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">I'm a Business Owner</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    I provide landscaping services to clients
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary dark:hover:border-primary"
                onClick={() => setUserType("employee")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">I'm an Employee</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    I work for a landscaping company
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : userType === "employee" ? (
          <EmployeeRegistration />
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                {userType === "client" ? "Client Information" : "Business Information"}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {userType === "client" 
                  ? "Tell us about yourself so we can connect you with the right landscapers"
                  : "Tell us about your business so clients can find you"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-gray-900 dark:text-gray-100">
                    {userType === "client" ? "Full Name" : "Contact Name"} *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={userType === "client" ? "Enter your full name" : "Enter your name"}
                    className="mt-2"
                  />
                </div>

                {userType === "business" && (
                  <>
                    <div>
                      <Label htmlFor="businessName" className="text-gray-900 dark:text-gray-100">
                        Business Name *
                      </Label>
                      <Input
                        id="businessName"
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder="Enter your business name"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessDescription" className="text-gray-900 dark:text-gray-100">
                        Business Description
                      </Label>
                      <Textarea
                        id="businessDescription"
                        value={formData.businessDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                        rows={3}
                        placeholder="Describe your landscaping services..."
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-900 dark:text-gray-100">Services Offered</Label>
                      <div className="flex gap-2 mt-2 mb-3">
                        <Input
                          type="text"
                          value={serviceInput}
                          onChange={(e) => setServiceInput(e.target.value)}
                          placeholder="e.g., Garden Design, Lawn Care"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addService}
                          size="sm"
                          className="px-4"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.services.map((service) => (
                          <Badge
                            key={service}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {service}
                            <button
                              type="button"
                              onClick={() => removeService(service)}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="phone" className="text-gray-900 dark:text-gray-100">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-gray-900 dark:text-gray-100">
                    Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your address"
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUserType(null)}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Complete Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
