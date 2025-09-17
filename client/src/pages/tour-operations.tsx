import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TourManualGenerator from "@/components/tours/tour-manual-generator";
import ConfirmationVoucherGenerator from "@/components/tours/confirmation-voucher-generator";
import OvernightListGenerator from "@/components/tours/overnight-list-generator";
import { format } from "date-fns";

interface Tour {
  id: string;
  clientName: string;
  quoteRef: string;
  tourType: string;
  startDate: string;
  endDate: string;
  status: string;
  depositDue?: string;
  releaseDate?: string;
  finalPayment?: string;
  notes?: string;
}

export default function TourOperations() {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: tours = [], isLoading } = useQuery<Tour[]>({
    queryKey: ["tours"],
    queryFn: async () => {
      const response = await fetch("/api/tours");
      if (!response.ok) throw new Error("Failed to fetch tours");
      return response.json();
    }
  });

  const statusColors = {
    Quote: "secondary",
    Provisional: "default",
    Confirmed: "default",
    Cancelled: "destructive"
  } as const;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tour Operations</h1>
        <div className="flex space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Tour
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
                {isLoading ? (
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
                          </div>
                          <Badge variant={statusColors[tour.status as keyof typeof statusColors]}>
                            {tour.status}
                          </Badge>
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
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="voucher">Voucher</TabsTrigger>
                <TabsTrigger value="overnight">Overnight</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="rooming">Rooming</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tour Overview - {selectedTour.clientName}</CardTitle>
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
                        <p className="text-sm text-gray-600">{selectedTour.tourType}</p>
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
                      {selectedTour.depositDue && (
                        <div>
                          <label className="text-sm font-medium">Deposit Due</label>
                          <p className="text-sm text-gray-600">{format(new Date(selectedTour.depositDue), "MMM dd, yyyy")}</p>
                        </div>
                      )}
                      {selectedTour.finalPayment && (
                        <div>
                          <label className="text-sm font-medium">Final Payment</label>
                          <p className="text-sm text-gray-600">{format(new Date(selectedTour.finalPayment), "MMM dd, yyyy")}</p>
                        </div>
                      )}
                    </div>
                    {selectedTour.notes && (
                      <div className="mt-4">
                        <label className="text-sm font-medium">Notes</label>
                        <p className="text-sm text-gray-600">{selectedTour.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Clients</p>
                          <p className="text-2xl font-bold">13</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Duration</p>
                          <p className="text-2xl font-bold">24 days</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium">Countries</p>
                          <p className="text-2xl font-bold">4</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Value</p>
                          <p className="text-2xl font-bold">€45K</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <TourManualGenerator />
              </TabsContent>

              <TabsContent value="voucher">
                <ConfirmationVoucherGenerator />
              </TabsContent>

              <TabsContent value="overnight">
                <OvernightListGenerator />
              </TabsContent>

              <TabsContent value="checklist">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Create tour file and folder</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Send provisional booking requests to suppliers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-gray-300 rounded" />
                        <span className="text-sm">Create overnight list</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-gray-300 rounded" />
                        <span className="text-sm">Send bookings update to agent</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-gray-300 rounded" />
                        <span className="text-sm">Load tour onto Tour Plan</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invoices">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoices & Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Invoice management will be implemented here.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rooming">
                <Card>
                  <CardHeader>
                    <CardTitle>Rooming List & Flight Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Rooming list and flight details management will be implemented here.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Manage Rooming
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Tour</h3>
                <p className="text-gray-600">Choose a tour from the list to view its operations details.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
