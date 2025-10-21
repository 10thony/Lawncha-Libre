import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

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
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Employee Management</h2>
      </div>

      {/* Employee Requests */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pending Employee Requests</h3>
        {employeeRequests?.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No pending employee requests</p>
        ) : (
          <div className="space-y-4">
            {employeeRequests?.map((request) => (
              <div key={request._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {request.firstName} {request.lastName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{request.email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{request.phone}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
          <p className="text-gray-500 dark:text-gray-400">No employees yet</p>
        ) : (
          <div className="space-y-4">
            {companyEmployees?.map((employee) => (
              <div key={employee._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{employee.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{employee.phone}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{employee.address}</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
