import { type FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Building2, Pencil, Plus, Star, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Modal } from "./ui/modal";

type BusinessFormData = {
  name: string;
  description: string;
  phone: string;
  address: string;
  services: string[];
  isPrimary: boolean;
};

type ManagedBusiness = {
  _id: Id<"businesses">;
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  services?: string[];
  isPrimary?: boolean;
};

const emptyForm: BusinessFormData = {
  name: "",
  description: "",
  phone: "",
  address: "",
  services: [],
  isPrimary: false,
};

export function BusinessManagement() {
  const businesses = useQuery(api.businesses.listMyBusinesses);
  const createBusiness = useMutation(api.businesses.createBusiness);
  const createBusinessFromProfile = useMutation(api.businesses.createBusinessFromProfile);
  const updateBusiness = useMutation(api.businesses.updateBusiness);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<ManagedBusiness | null>(null);
  const [formData, setFormData] = useState<BusinessFormData>(emptyForm);
  const [serviceInput, setServiceInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const modalTitle = editingBusiness ? "Edit Business" : "Add Business";

  const canSetPrimary = useMemo(() => {
    if (!businesses || businesses.length === 0) return false;
    return businesses.length > 1;
  }, [businesses]);

  const openCreateModal = () => {
    setEditingBusiness(null);
    setFormData({
      ...emptyForm,
      isPrimary: businesses?.length === 0,
    });
    setServiceInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (business: ManagedBusiness) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name || "",
      description: business.description || "",
      phone: business.phone || "",
      address: business.address || "",
      services: business.services || [],
      isPrimary: !!business.isPrimary,
    });
    setServiceInput("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingBusiness(null);
    setFormData(emptyForm);
    setServiceInput("");
  };

  const addService = () => {
    const value = serviceInput.trim();
    if (!value) return;
    if (formData.services.includes(value)) {
      setServiceInput("");
      return;
    }
    setFormData((prev) => ({ ...prev, services: [...prev.services, value] }));
    setServiceInput("");
  };

  const removeService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((item) => item !== service),
    }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    const normalizedName = formData.name.trim();
    if (!normalizedName) {
      toast.error("Business name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: normalizedName,
        description: formData.description.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        services: formData.services.length > 0 ? formData.services : undefined,
        isPrimary: formData.isPrimary,
      };

      if (editingBusiness) {
        await updateBusiness({
          businessId: editingBusiness._id,
          ...payload,
        });
        toast.success("Business updated");
      } else {
        await createBusiness(payload);
        toast.success("Business created");
      }

      closeModal();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not save business";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFromProfile = async () => {
    try {
      await createBusinessFromProfile({});
      toast.success("Business created from profile details");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not create business from profile";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Business Entities</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create and manage multiple businesses under your owner profile.
          </p>
        </div>
        <Button type="button" onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Business
        </Button>
      </div>

      {businesses === undefined ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-600 dark:text-gray-400">
            Loading businesses...
          </CardContent>
        </Card>
      ) : businesses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Building2 className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">No businesses created yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add your first business to start organizing projects and services.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button type="button" variant="outline" onClick={handleCreateFromProfile}>
                Create from Profile
              </Button>
              <Button type="button" onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {businesses.map((business) => (
            <Card key={business._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      {business.name}
                      {business.isPrimary && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </Badge>
                      )}
                    </CardTitle>
                    {business.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {business.description}
                      </p>
                    )}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => openEditModal(business)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Phone:</span>{" "}
                    <span className="text-gray-800 dark:text-gray-200">{business.phone || "Not set"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Address:</span>{" "}
                    <span className="text-gray-800 dark:text-gray-200">{business.address || "Not set"}</span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Services</p>
                  {business.services && business.services.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {business.services.map((service) => (
                        <Badge key={`${business._id}-${service}`} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No services listed</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        description="Set business details for your owner account."
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <Label htmlFor="business-name">Business Name *</Label>
            <Input
              id="business-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter business name"
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="business-description">Description</Label>
            <Textarea
              id="business-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this business..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business-phone">Phone</Label>
              <Input
                id="business-phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 555-5555"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="business-address">Address</Label>
              <Input
                id="business-address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Business address"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label>Services</Label>
            <div className="flex gap-2 mt-2 mb-3">
              <Input
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addService();
                  }
                }}
                placeholder="Add a service"
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={addService}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.services.map((service) => (
                <Badge key={service} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {service}
                  <button
                    type="button"
                    onClick={() => removeService(service)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label={`Remove ${service}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {canSetPrimary && (
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={formData.isPrimary}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPrimary: e.target.checked }))}
              />
              Set as primary business
            </label>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingBusiness ? "Save Changes" : "Create Business"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
