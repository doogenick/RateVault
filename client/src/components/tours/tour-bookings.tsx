import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BookingWithSupplier } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Calendar, Users, FileText, AlertCircle } from "lucide-react";
import BookingForm from "@/components/bookings/booking-form";

interface TourBookingsProps {
  tourId: string;
  bookings: BookingWithSupplier[];
  isLoading: boolean;
}

export default function TourBookings({ tourId, bookings, isLoading }: TourBookingsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tours/${tourId}/bookings`] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to delete booking",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, serviceDesc: string) => {
    if (confirm(`Are you sure you want to delete the booking for "${serviceDesc}"?`)) {
      deleteBookingMutation.mutate(id);
    }
  };

  const getDepositStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Not Required": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case "Accommodation": return "bg-blue-100 text-blue-800";
      case "Activity": return "bg-green-100 text-green-800";
      case "Transfer": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalPax = bookings.reduce((sum, booking) => sum + booking.pax, 0);
  const pendingDeposits = bookings.filter(booking => booking.depositStatus === "Pending").length;
  const confirmedBookings = bookings.filter(booking => booking.confirmationNo).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="mr-2 w-5 h-5" />
            Bookings Management
          </CardTitle>
          <Button onClick={() => setIsFormOpen(true)} data-testid="button-add-booking">
            <Plus className="mr-2 w-4 h-4" />
            Add Booking
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Booking Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-muted-foreground mr-2" />
              <div>
                <p className="text-sm font-medium text-foreground">Total Pax</p>
                <p className="text-2xl font-bold">{totalPax}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
              <div>
                <p className="text-sm font-medium text-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{confirmedBookings}</p>
                <p className="text-xs text-muted-foreground">of {bookings.length} bookings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-muted-foreground mr-2" />
              <div>
                <p className="text-sm font-medium text-foreground">Pending Deposits</p>
                <p className="text-2xl font-bold">{pendingDeposits}</p>
                <p className="text-xs text-muted-foreground">require attention</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto w-12 h-12 mb-4" />
            <p>No bookings found</p>
            <p className="text-sm">Add your first booking to get started</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Pax</TableHead>
                  <TableHead>Confirmation</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{booking.serviceDesc}</div>
                        {booking.notes && (
                          <div className="text-sm text-muted-foreground mt-1">{booking.notes}</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{booking.supplier.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Badge className={`px-2 py-1 text-xs font-medium rounded-md ${getServiceTypeColor(booking.supplier.serviceType)}`}>
                            {booking.supplier.serviceType}
                          </Badge>
                          <span className="ml-2">{booking.supplier.region}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {booking.checkIn && booking.checkOut ? (
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Calendar className="mr-1 w-4 h-4 text-muted-foreground" />
                            <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                          </div>
                          <div className="text-muted-foreground ml-5">
                            to {new Date(booking.checkOut).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not specified</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-1 w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{booking.pax}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {booking.confirmationNo ? (
                        <div>
                          <span className="font-mono text-sm bg-green-50 text-green-800 px-2 py-1 rounded">
                            {booking.confirmationNo}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`px-2 py-1 text-xs font-medium rounded-md ${getDepositStatusColor(booking.depositStatus)}`}>
                        {booking.depositStatus}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-edit-booking-${booking.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(booking.id, booking.serviceDesc)}
                          data-testid={`button-delete-booking-${booking.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Booking Form Dialog */}
        <BookingForm 
          open={isFormOpen} 
          onClose={() => setIsFormOpen(false)}
          defaultTourId={tourId}
        />
      </CardContent>
    </Card>
  );
}
