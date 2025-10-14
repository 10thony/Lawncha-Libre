import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [userType, setUserType] = useState<"client" | "business" | null>(null);
  const [formData, setFormData] = useState({
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
        userType,
        ...(userType === "business" ? formData : { phone: formData.phone, address: formData.address }),
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Complete Your Profile
      </h1>

      {!userType ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center mb-6">
            Are you a client or a business owner?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setUserType("client")}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-lg font-semibold mb-2">I'm a Client</h3>
              <p className="text-gray-600">
                I'm looking for landscaping services for my property
              </p>
            </button>
            <button
              onClick={() => setUserType("business")}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-4xl mb-3">🌿</div>
              <h3 className="text-lg font-semibold mb-2">I'm a Business Owner</h3>
              <p className="text-gray-600">
                I provide landscaping services to clients
              </p>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">
              {userType === "client" ? "Client Information" : "Business Information"}
            </h2>
          </div>

          {userType === "business" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Offered
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    placeholder="e.g., Garden Design, Lawn Care"
                    className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addService}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => removeService(service)}
                        className="text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUserType(null)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Complete Profile
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
