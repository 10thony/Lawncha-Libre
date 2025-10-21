import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Employee Registration
      </h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> After submitting this form, your request will be sent to the company owner for approval. 
          You will be notified once your request has been reviewed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company *
          </label>
          <select
            required
            value={formData.companyId}
            onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
          >
            <option value="">Select a company</option>
            {businessOwners?.map((business) => (
              <option key={business._id} value={business._id}>
                {business.businessName || business.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Submit Employee Request
        </button>
      </form>
    </div>
  );
}
