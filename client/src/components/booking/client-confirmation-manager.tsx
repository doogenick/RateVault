import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Mail, 
  Send, 
  AlertCircle,
  User,
  Building2
} from "lucide-react";
import { format } from "date-fns";

interface ClientConfirmation {
  id: string;
  tourId: string;
  clientType: "direct_client" | "travel_agent";
  clientName: string;
  confirmationType: "provisional" | "final";
  confirmationDate: string;
  depositAmount?: number;
  depositPaid: boolean;
  depositDate?: string;
  finalPaymentAmount?: number;
  finalPaymentPaid: boolean;
  finalPaymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}

interface SupplierNotification {
  id: string;
  supplierName: string;
  notificationType: "provisional_booking" | "final_confirmation" | "release";
  sentDate: string;
  status: "sent" | "delivered" | "failed";
  responseReceived: boolean;
  confirmationNumber?: string;
}

const statusColors = {
  provisional: "default",
  final: "default",
  pending: "secondary"
} as const;

const clientTypeLabels = {
  direct_client: "Direct Client",
  travel_agent: "Travel Agent"
} as const;

const notificationTypeLabels = {
  provisional_booking: "Provisional Booking",
  final_confirmation: "Final Confirmation", 
  release: "Release"
} as const;

export default function ClientConfirmationManager({ 
  tourId, 
  onConfirmationChange 
}: { 
  tourId: string; 
  onConfirmationChange: () => void; 
}) {
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [confirmationType, setConfirmationType] = useState<"provisional" | "final">("provisional");

  // Mock data - in real app this would come from API
  const [confirmations] = useState<ClientConfirmation[]>([
    {
      id: "1",
      tourId: tourId,
      clientType: "travel_agent",
      clientName: "Borcherds Travel",
      confirmationType: "provisional",
      confirmationDate: "2025-08-15",
      depositAmount: 5000,
      depositPaid: true,
      depositDate: "2025-08-16",
      notes: "Deposit received, waiting for final confirmation"
    }
  ]);

  const [notifications] = useState<SupplierNotification[]>([
    {
      id: "1",
      supplierName: "Movenpick Hotel",
      notificationType: "provisional_booking",
      sentDate: "2025-08-16T10:30:00Z",
      status: "delivered",
      responseReceived: true,
      confirmationNumber: "298346"
    },
    {
      id: "2", 
      supplierName: "Stay @ Swakop",
      notificationType: "provisional_booking",
      sentDate: "2025-08-16T10:35:00Z",
      status: "delivered",
      responseReceived: true,
      confirmationNumber: "250204-003"
    }
  ]);

  const handleClientConfirmation = (type: "provisional" | "final") => {
    // Here you would create a new client confirmation
    console.log(`Client ${type} confirmation received`);
    onConfirmationChange();
  };

  const sendSupplierNotifications = (type: "provisional_booking" | "final_confirmation") => {
    // Here you would send notifications to all suppliers
    console.log(`Sending ${type} notifications to suppliers`);
  };

  const getConfirmationStatus = () => {
    const hasProvisional = confirmations.some(c => c.confirmationType === "provisional");
    const hasFinal = confirmations.some(c => c.confirmationType === "final");
    
    if (hasFinal) return { status: "final", label: "Fully Confirmed" };
    if (hasProvisional) return { status: "provisional", label: "Provisional" };
    return { status: "pending", label: "Pending" };
  };

  const confirmationStatus = getConfirmationStatus();

  return (
    <div className="space-y-6">
      {/* Client Confirmation Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Confirmation Status</CardTitle>
            <Badge variant={statusColors[confirmationStatus.status as keyof typeof statusColors]}>
              {confirmationStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {confirmations.map((confirmation) => (
              <div key={confirmation.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{confirmation.clientName}</span>
                    <Badge variant="outline">
                      {clientTypeLabels[confirmation.clientType]}
                    </Badge>
                  </div>
                  <Badge variant={statusColors[confirmation.confirmationType]}>
                    {confirmation.confirmationType}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Confirmation Date:</span>
                    <p>{format(new Date(confirmation.confirmationDate), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Deposit:</span>
                    <p className={confirmation.depositPaid ? "text-green-600" : "text-red-600"}>
                      {confirmation.depositPaid ? "✓ Paid" : "✗ Pending"}
                    </p>
                  </div>
                  {confirmation.finalPaymentAmount && (
                    <>
                      <div>
                        <span className="text-gray-600">Final Payment:</span>
                        <p className={confirmation.finalPaymentPaid ? "text-green-600" : "text-red-600"}>
                          {confirmation.finalPaymentPaid ? "✓ Paid" : "✗ Pending"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment Method:</span>
                        <p>{confirmation.paymentMethod || "Not specified"}</p>
                      </div>
                    </>
                  )}
                </div>
                
                {confirmation.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Notes:</strong> {confirmation.notes}
                  </div>
                )}
              </div>
            ))}

            {confirmations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No client confirmations yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Confirmation Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Client Confirmation Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Provisional Confirmation</h4>
              <p className="text-sm text-gray-600">
                Client/Agent confirms tour but hasn't made final payment yet
              </p>
              <Button 
                onClick={() => handleClientConfirmation("provisional")}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Record Provisional Confirmation
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Final Confirmation</h4>
              <p className="text-sm text-gray-600">
                Client/Agent has made final payment and tour is confirmed
              </p>
              <Button 
                onClick={() => handleClientConfirmation("final")}
                className="w-full"
                variant="outline"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Record Final Confirmation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Supplier Notifications</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendSupplierNotifications("provisional_booking")}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Provisional
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendSupplierNotifications("final_confirmation")}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Final
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{notification.supplierName}</p>
                    <p className="text-sm text-gray-600">
                      {notificationTypeLabels[notification.notificationType]} • 
                      {format(new Date(notification.sentDate), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {notification.confirmationNumber && (
                    <Badge variant="outline" className="font-mono">
                      {notification.confirmationNumber}
                    </Badge>
                  )}
                  <Badge 
                    variant={notification.status === "delivered" ? "default" : "secondary"}
                  >
                    {notification.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
