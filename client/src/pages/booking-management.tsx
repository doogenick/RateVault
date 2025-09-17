import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Users, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  DollarSign, 
  Building2,
  Download,
  Plus,
  Eye,
  Edit,
  Mail,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BookingRequestForm from "@/components/booking/booking-request-form";
import EmailTemplateEditor from "@/components/booking/email-template-editor";
import ClientConfirmationManager from "@/components/booking/client-confirmation-manager";
import { format } from "date-fns";

interface Tour {
  id: string;
  clientName: string;
  quoteRef: string;
  tourType: "FIT" | "Group" | "Charter";
  startDate: string;
  endDate: string;
  status: string;
  paxCount: number;
  tourCode?: string;
  depositDue?: string;
  releaseDate?: string;
  finalPayment?: string;
  notes?: string;
}

interface BookingRequest {
  id: string;
  tourId: string;
  supplierId: string;
  supplierName: string;
  accommodation: string;
  checkIn: string;
  checkOut: string;
  paxCount: number;
  roomType: string;
  roomConfiguration: string;
  mealPlan: string;
  status: "pending" | "confirmed" | "declined" | "cancelled";
  confirmationNumber?: string;
  responseDate?: string;
  emailSent: boolean;
  emailSentDate?: string;
  specialRequests?: string;
}

const statusColors = {
  pending: "default",
  confirmed: "default", 
  declined: "destructive",
  cancelled: "secondary"
} as const;

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  declined: XCircle,
  cancelled: AlertCircle
} as const;

export default function BookingManagement() {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showBookingRequestForm, setShowBookingRequestForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: tours = [], isLoading: toursLoading } = useQuery<Tour[]>({
    queryKey: ["tours"],
    queryFn: async () => {
      const response = await fetch("/api/tours");
      if (!response.ok) throw new Error("Failed to fetch tours");
      return response.json();
    }
  });

  const { data: bookingRequests = [], isLoading: requestsLoading } = useQuery<BookingRequest[]>({
    queryKey: ["booking-requests", selectedTour?.id],
    queryFn: async () => {
      if (!selectedTour) return [];
      const response = await fetch(`/api/booking-requests?tourId=${selectedTour.id}`);
      if (!response.ok) throw new Error("Failed to fetch booking requests");
      return response.json();
    },
    enabled: !!selectedTour
  });

  const generateTourCode = (tour: Tour) => {
    const year = new Date(tour.startDate).getFullYear().toString().slice(-2);
    const month = (new Date(tour.startDate).getMonth() + 1).toString().padStart(2, '0');
    const day = new Date(tour.startDate).getDate().toString().padStart(2, '0');
    const type = tour.tourType === "FIT" ? "F" : tour.tourType === "Group" ? "G" : "C";
    return `${type}${year}${month}${day}R`;
  };

  const getDaysUntilDeparture = (startDate: string) => {
    const today = new Date();
    const departure = new Date(startDate);
    const diffTime = departure.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return "text-red-600";
    if (days <= 7) return "text-orange-600";
    if (days <= 30) return "text-yellow-600";
    return "text-green-600";
  };

  const sendBookingRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(`/api/booking-requests/${requestId}/send-email`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("Failed to send email");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
    }
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ requestId, status, confirmationNumber, notes }: {
      requestId: string;
      status: string;
      confirmationNumber?: string;
      notes?: string;
    }) => {
      const response = await fetch(`/api/booking-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, confirmationNumber, responseNotes: notes })
      });
      if (!response.ok) throw new Error("Failed to update booking status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowBookingRequestForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Booking Request
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tours List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Active Tours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {toursLoading ? (
                  <div className="text-center py-4">Loading tours...</div>
                ) : tours.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No tours found</div>
                ) : (
                  tours.map((tour) => {
                    const daysUntil = getDaysUntilDeparture(tour.startDate);
                    return (
                      <div
                        key={tour.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTour?.id === tour.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedTour(tour)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{tour.clientName}</p>
                            <p className="text-sm text-gray-600">{tour.quoteRef}</p>
                            <p className="text-xs text-gray-500">{tour.tourType} • {tour.paxCount} pax</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={statusColors[tour.status as keyof typeof statusColors]}>
                              {tour.status}
                            </Badge>
                            {tour.tourCode && (
                              <p className="text-xs text-gray-500 mt-1">{tour.tourCode}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {format(new Date(tour.startDate), "MMM dd, yyyy")}
                          </span>
                          <span className={getUrgencyColor(daysUntil)}>
                            {daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` : 
                             daysUntil === 0 ? "Today" : 
                             `${daysUntil} days`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tour Details */}
        <div className="lg:col-span-2">
          {selectedTour ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="confirmations">Confirmations</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Tour Overview - {selectedTour.clientName}</CardTitle>
                      {!selectedTour.tourCode && (
                        <Button onClick={() => {
                          const tourCode = generateTourCode(selectedTour);
                          // Here you would call an API to assign the tour code
                          console.log("Assigning tour code:", tourCode);
                        }}>
                          Assign Tour Code
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Client Name</label>
                        <p className="text-sm text-gray-600">{selectedTour.clientName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Quote Reference</label>
                        <p className="text-sm text-gray-600">{selectedTour.quoteRef}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Tour Type</label>
                        <Badge variant="outline">{selectedTour.tourType}</Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Tour Code</label>
                        <p className="text-sm text-gray-600 font-mono">
                          {selectedTour.tourCode || "Not assigned"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Pax Count</label>
                        <p className="text-sm text-gray-600">{selectedTour.paxCount}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Badge variant={statusColors[selectedTour.status as keyof typeof statusColors]}>
                          {selectedTour.status}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <p className="text-sm text-gray-600">{format(new Date(selectedTour.startDate), "MMM dd, yyyy")}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">End Date</label>
                        <p className="text-sm text-gray-600">{format(new Date(selectedTour.endDate), "MMM dd, yyyy")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="confirmations" className="space-y-4">
                <ClientConfirmationManager 
                  tourId={selectedTour.id}
                  onConfirmationChange={() => {
                    // Refresh data when confirmations change
                    queryClient.invalidateQueries({ queryKey: ["tours"] });
                    queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
                  }}
                />
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Confirmed Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Accommodation</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Pax</TableHead>
                          <TableHead>Confirmation</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingRequests
                          .filter(req => req.status === "confirmed")
                          .map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>{request.supplierName}</TableCell>
                              <TableCell>{request.accommodation}</TableCell>
                              <TableCell>
                                {format(new Date(request.checkIn), "MMM dd")} - {format(new Date(request.checkOut), "MMM dd")}
                              </TableCell>
                              <TableCell>{request.paxCount}</TableCell>
                              <TableCell className="font-mono">{request.confirmationNumber}</TableCell>
                              <TableCell>
                                <Badge variant={statusColors[request.status]}>
                                  {request.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Accommodation</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Pax</TableHead>
                          <TableHead>Email Sent</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingRequests.map((request) => {
                          const StatusIcon = statusIcons[request.status];
                          return (
                            <TableRow key={request.id}>
                              <TableCell>{request.supplierName}</TableCell>
                              <TableCell>{request.accommodation}</TableCell>
                              <TableCell>
                                {format(new Date(request.checkIn), "MMM dd")} - {format(new Date(request.checkOut), "MMM dd")}
                              </TableCell>
                              <TableCell>{request.paxCount}</TableCell>
                              <TableCell>
                                {request.emailSent ? (
                                  <Badge variant="default">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Sent
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Not Sent</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <StatusIcon className="h-4 w-4" />
                                  <Badge variant={statusColors[request.status]}>
                                    {request.status}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  {!request.emailSent && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => sendBookingRequest.mutate(request.id)}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="space-y-4">
                <EmailTemplateEditor />
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Booking status history and changes will be tracked here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Tour</h3>
                <p className="text-gray-600">Choose a tour from the list to manage its bookings.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Request Form Modal */}
      {showBookingRequestForm && (
        <BookingRequestForm
          onClose={() => setShowBookingRequestForm(false)}
          onSave={(data) => {
            console.log("Saving booking request:", data);
            setShowBookingRequestForm(false);
            // Here you would call the API to save the booking request
          }}
        />
      )}
    </div>
  );
}
