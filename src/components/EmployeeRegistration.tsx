import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { ThemeToggle } from "./ui/theme-toggle";
import { SignOutButton } from "../SignOutButton";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { 
  Users, 
  Building2, 
  Info,
  ArrowLeft
} from "lucide-react";

export function EmployeeRegistration() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: "",
  });

  const createEmployeeRequest = useMutation(api.profiles.createEmployeeRequest);
  const createProfile = useMutation(api.profiles.createProfile);
  const businessOwners = useQuery(api.profiles.getBusinessOwners);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyId) {
      toast.error("Please select a company");
      return;
    }

    try {
      // First create the employee profile
      await createProfile({
        name: `${formData.firstName} ${formData.lastName}`,
        userType: "employee",
        phone: formData.phone,
        companyId: formData.companyId as any,
      });

      // Then create the employee request
      await createEmployeeRequest({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        companyId: formData.companyId as any,
      });
      
      toast.success("Employee request submitted successfully! The company owner will review your request.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyId: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit employee request");
    }
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

      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Employee Registration
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Join a landscaping company and start your journey
          </p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Fill out your information to request access to a landscaping company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-1">
                    Approval Required
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    After submitting this form, your request will be sent to the company owner for approval. 
                    You will be notified once your request has been reviewed.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-900 dark:text-gray-100">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName" className="text-gray-900 dark:text-gray-100">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-900 dark:text-gray-100">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="company" className="text-gray-900 dark:text-gray-100">
                  Company *
                </Label>
                <Select value={formData.companyId} onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessOwners?.map((business) => (
                      <SelectItem key={business._id} value={business._id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {business.businessName || business.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
              >
                Submit Employee Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
