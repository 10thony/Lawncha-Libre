import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  Quote, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Eye,
  CheckCircle,
  AlertCircle,
  Search,
  Link,
  Unlink
} from "lucide-react";
import { toast } from "sonner";

interface ClientIntakeFormsProps {
  profile: any;
}

interface IntakeFormDetails {
  _id: Id<"intakeForms">;
  _creationTime: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectDescription: string;
  imageUrls?: string[];
  videoUrls?: string[];
  status: "submitted" | "claimed" | "in_progress" | "completed" | "cancelled";
  businessOwnerClerkId?: string;
  clientClerkId?: string;
  submittedAt: number;
  claimedAt?: number;
  linkedAt?: number;
  businessNotes?: string;
  estimatedQuote?: number;
}

export function ClientIntakeForms({ profile }: ClientIntakeFormsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [emailToSearch, setEmailToSearch] = useState("");
  const [searchResults, setSearchResults] = useState<IntakeFormDetails[]>([]);

  // Fetch intake forms
  const myIntakeForms = useQuery(api.intakeForms.getIntakeFormsByClient);
  const searchIntakeFormsByEmail = useMutation(api.intakeForms.searchIntakeFormsByEmail);
  const linkIntakeFormToClient = useMutation(api.intakeForms.linkIntakeFormToClient);

  // Filter forms based on search
  const filteredForms = myIntakeForms?.filter(form => 
    form.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.projectDescription.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSearchByEmail = async () => {
    if (!emailToSearch.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      const results = await searchIntakeFormsByEmail({ email: emailToSearch.trim() });
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info("No intake forms found for this email address");
      }
    } catch (error) {
      console.error("Error searching intake forms:", error);
      toast.error("Failed to search intake forms. Please try again.");
    }
  };

  const handleLinkForm = async (formId: Id<"intakeForms">) => {
    try {
      await linkIntakeFormToClient({
        intakeFormId: formId,
        clientClerkId: profile.clerkUserId,
      });
      toast.success("Intake form linked to your account successfully!");
      setShowLinkDialog(false);
      setEmailToSearch("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error linking form:", error);
      toast.error("Failed to link intake form. Please try again.");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-transparent text-[#394b6b] dark:text-blue-400 border border-[#394b6b]/30 dark:border-blue-900/60";
      case "claimed": return "bg-transparent text-primary border border-primary/30";
      case "in_progress": return "bg-transparent text-[#276749] dark:text-emerald-400 border border-[#276749]/30 dark:border-emerald-900/60";
      case "completed": return "bg-secondary text-foreground";
      case "cancelled": return "bg-transparent text-destructive border border-destructive/30";
      default: return "bg-secondary text-foreground";
    }
  };

  const IntakeFormCard = ({ form }: { form: IntakeFormDetails }) => (
    <Card className="hover:bg-accent transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{form.firstName} {form.lastName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-3 w-3" />
              {form.email}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(form.status)}>
            {form.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            {form.phone}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Submitted {formatDate(form.submittedAt)}
          </div>

          <p className="text-sm text-secondary-foreground line-clamp-2">
            {form.projectDescription}
          </p>

          {form.businessNotes && (
            <div className="bg-card p-3">
              <h4 className="text-sm font-medium text-primary mb-1">Business Notes:</h4>
              <p className="text-sm text-primary">{form.businessNotes}</p>
            </div>
          )}

          {form.estimatedQuote && (
            <div className="bg-card p-3">
              <h4 className="text-sm font-medium text-[#276749] dark:text-emerald-400 mb-1">Estimated Quote:</h4>
              <p className="text-lg font-semibold text-[#276749] dark:text-emerald-400">${form.estimatedQuote.toLocaleString()}</p>
            </div>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Full Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Quote Request Details</DialogTitle>
                <DialogDescription>
                  Complete details of your quote request
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{form.firstName} {form.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{form.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{form.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(form.submittedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <h3 className="font-semibold mb-3">Project Description</h3>
                  <div className="border border-border bg-secondary p-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {form.projectDescription}
                    </p>
                  </div>
                </div>

                {/* Business Response */}
                {(form.businessNotes || form.estimatedQuote) && (
                  <div>
                    <h3 className="font-semibold mb-3">Business Response</h3>
                    {form.businessNotes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-secondary-foreground mb-2">Notes:</h4>
                        <div className="bg-card p-3">
                          <p className="text-sm text-primary">{form.businessNotes}</p>
                        </div>
                      </div>
                    )}
                    {form.estimatedQuote && (
                      <div>
                        <h4 className="text-sm font-medium text-secondary-foreground mb-2">Estimated Quote:</h4>
                        <div className="bg-card p-3">
                          <p className="text-xl font-semibold text-[#276749] dark:text-emerald-400">${form.estimatedQuote.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Timeline */}
                <div>
                  <h3 className="font-semibold mb-3">Status Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Submitted on {formatDate(form.submittedAt)}</span>
                    </div>
                    {form.claimedAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Claimed by business on {formatDate(form.claimedAt)}</span>
                      </div>
                    )}
                    {form.linkedAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-[#276749] dark:bg-emerald-400 rounded-full"></div>
                        <span>Linked to your account on {formatDate(form.linkedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif-display text-2xl text-foreground">My Quote Requests</h2>
          <p className="text-muted-foreground">View and manage your submitted quote requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Link className="h-4 w-4 mr-2" />
                Link Existing Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Existing Quote Request</DialogTitle>
                <DialogDescription>
                  If you submitted a quote request before creating an account, you can link it to your profile using the email address you used.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address Used</label>
                  <Input
                    value={emailToSearch}
                    onChange={(e) => setEmailToSearch(e.target.value)}
                    placeholder="Enter the email address you used when submitting the request"
                  />
                </div>
                
                <Button onClick={handleSearchByEmail} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search for Requests
                </Button>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Found {searchResults.length} request(s):</h4>
                    {searchResults.map((form) => (
                      <Card key={form._id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{form.firstName} {form.lastName}</span>
                            <Badge className={getStatusColor(form.status)}>
                              {form.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{form.projectDescription}</p>
                          <p className="text-xs text-muted-foreground">Submitted {formatDate(form.submittedAt)}</p>
                          <Button
                            size="sm"
                            onClick={() => handleLinkForm(form._id)}
                            disabled={form.clientClerkId === profile.clerkUserId}
                            className="w-full"
                          >
                            {form.clientClerkId === profile.clerkUserId ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Already Linked
                              </>
                            ) : (
                              <>
                                <Link className="h-4 w-4 mr-2" />
                                Link to My Account
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            Request Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="font-serif-display text-2xl text-primary">
                {filteredForms.filter(f => f.status === "submitted").length}
              </div>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </div>
            <div className="text-center">
              <div className="font-serif-display text-2xl text-primary">
                {filteredForms.filter(f => f.status === "claimed").length}
              </div>
              <p className="text-sm text-muted-foreground">Claimed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#276749] dark:text-emerald-400">
                {filteredForms.filter(f => f.status === "in_progress").length}
              </div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {filteredForms.filter(f => f.status === "completed").length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Quote Requests */}
      {filteredForms.length > 0 ? (
        <div className="grid gap-4">
          {filteredForms.map((form) => (
            <IntakeFormCard key={form._id} form={form} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Quote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Quote Requests Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms." : "You haven't submitted any quote requests yet."}
            </p>
            <p className="text-sm text-muted-foreground">
              Visit our homepage to submit a new quote request for your project.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
