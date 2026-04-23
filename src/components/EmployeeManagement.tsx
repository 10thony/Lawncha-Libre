import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Link2, Copy } from "lucide-react";
import { buildEmployeeInviteUrl } from "../employeeInvite";

interface EmployeeManagementProps {
  profile: any;
}

export function EmployeeManagement({ profile }: EmployeeManagementProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const employeeRequests = useQuery(api.profiles.getEmployeeRequests);
  const companyEmployees = useQuery(api.profiles.getCompanyEmployees);
  const approveRequest = useMutation(api.profiles.approveEmployeeRequest);
  const rejectRequest = useMutation(api.profiles.rejectEmployeeRequest);
  const createEmployeeInvite = useMutation(api.profiles.createEmployeeInvite);

  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const handleCreateInvite = async () => {
    try {
      const { token } = await createEmployeeInvite({});
      const url = buildEmployeeInviteUrl(token);
      setInviteUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success("Invitation link copied to clipboard.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create invite";
      toast.error(message);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Link copied.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest({ requestId: requestId as any });
      toast.success("Employee request approved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest({ 
        requestId: requestId as any,
        rejectionReason: rejectionReason || undefined
      });
      toast.success("Employee request rejected");
      setRejectionReason("");
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to reject request");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-transparent text-primary border border-primary/30";
      case "approved":
        return "bg-transparent text-[#276749] dark:text-emerald-400 border border-[#276749]/30 dark:border-emerald-900/60";
      case "rejected":
        return "bg-transparent text-destructive border border-destructive/30";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif-display text-2xl text-foreground">Employee Management</h2>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Invite employees
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              Create a link that sends new hires through sign-up or sign-in, then straight to the employee
              onboarding form for your company. Links expire after 30 days.
            </p>
          </div>
          <Button type="button" onClick={handleCreateInvite} className="shrink-0">
            <Copy className="h-4 w-4 mr-2" />
            Create &amp; copy link
          </Button>
        </div>
        {inviteUrl && (
          <div className="mt-4 border border-border bg-muted/40 p-3 flex flex-col sm:flex-row gap-2 sm:items-center">
            <code className="text-xs break-all flex-1 text-foreground">{inviteUrl}</code>
            <Button type="button" variant="outline" size="sm" onClick={handleCopyInvite}>
              Copy again
            </Button>
          </div>
        )}
      </Card>

      {/* Employee Requests */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pending Employee Requests</h3>
        {employeeRequests?.length === 0 ? (
          <p className="text-muted-foreground">No pending employee requests</p>
        ) : (
          <div className="space-y-4">
            {employeeRequests?.map((request) => (
              <div key={request._id} className="border border-border p-4 hover:bg-accent transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {request.firstName} {request.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <p className="text-sm text-muted-foreground">{request.phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested on {formatDate(request.requestedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setRejectionReason("");
                          }}
                        >
                          Reject
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Employee Request Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium">Personal Information</h4>
                                <p><strong>Name:</strong> {request.firstName} {request.lastName}</p>
                                <p><strong>Email:</strong> {request.email}</p>
                                <p><strong>Phone:</strong> {request.phone}</p>
                                <p><strong>Requested:</strong> {formatDate(request.requestedAt)}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Current Employees */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Employees</h3>
        {companyEmployees?.length === 0 ? (
          <p className="text-muted-foreground">No employees yet</p>
        ) : (
          <div className="space-y-4">
            {companyEmployees?.map((employee) => (
              <div key={employee._id} className="border border-border p-4 hover:bg-accent transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{employee.name}</h4>
                    <p className="text-sm text-muted-foreground">{employee.phone}</p>
                    <p className="text-sm text-muted-foreground">{employee.address}</p>
                    <Badge className={getStatusColor(employee.employeeStatus || "approved")}>
                      {employee.employeeStatus || "approved"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={!!selectedRequest && selectedRequest.status === "pending"}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Employee Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to reject {selectedRequest?.firstName} {selectedRequest?.lastName}'s request?</p>
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-border bg-input text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedRequest?._id)}
              >
                Reject Request
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
