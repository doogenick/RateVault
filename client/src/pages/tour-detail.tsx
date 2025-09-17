import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TourBookings from "@/components/tours/tour-bookings";
import TourInfo from "@/components/tours/tour-info";
import { ArrowLeft, Calendar, Users, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tour, BookingWithSupplier } from "@shared/schema";

export default function TourDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const tourId = params.id;

  const { data: tour, isLoading: tourLoading } = useQuery<Tour>({
    queryKey: [`/api/tours/${tourId}`],
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithSupplier[]>({
    queryKey: [`/api/tours/${tourId}/bookings`],
  });

  if (tourLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tour details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tour Not Found</h2>
            <p className="text-muted-foreground mb-4">The tour you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/tours")}>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Tours
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-100 text-green-800";
      case "Provisional": return "bg-yellow-100 text-yellow-800";
      case "Quote": return "bg-blue-100 text-blue-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTourTypeIcon = (tourType: string) => {
    return tourType === "Group" ? Users : Calendar;
  };

  const TourIcon = getTourTypeIcon(tour.tourType);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={`${tour.clientName} - ${tour.quoteRef}`}
          subtitle={`${tour.tourType} Tour • ${tour.status}`}
        />
        
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => setLocation("/tours")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Tours
          </Button>

          {/* Tour Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tour Type</CardTitle>
                <TourIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tour.tourType}</div>
                <p className="text-xs text-muted-foreground">
                  {tour.tourType === "FIT" ? "≤8 passengers" : ">8 passengers"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Badge className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(tour.status)}`}>
                  {tour.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tour.status}</div>
                <p className="text-xs text-muted-foreground">
                  Current status
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duration</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.ceil((new Date(tour.endDate).getTime() - new Date(tour.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(tour.startDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
                <p className="text-xs text-muted-foreground">
                  {bookingsLoading ? "Loading..." : "Total bookings"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tour Information */}
          <TourInfo tour={tour} />

          {/* Bookings Management */}
          <TourBookings tourId={tourId} bookings={bookings} isLoading={bookingsLoading} />
        </main>
      </div>
    </div>
  );
}
