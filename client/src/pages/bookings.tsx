import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/ui/status-badge";
import type { BookingWithSupplier } from "@shared/schema";

export default function Bookings() {
  const { data: bookings = [] } = useQuery<BookingWithSupplier[]>({
    queryKey: ["/api/bookings"],
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Bookings" subtitle="Manage service bookings and confirmations" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-card rounded-lg border border-border p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No bookings found</p>
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
                      <TableHead>Deposit Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.serviceDesc}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.supplier.name}</div>
                            <div className="text-sm text-muted-foreground">{booking.supplier.region}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.checkIn && booking.checkOut ? (
                            <div className="text-sm">
                              <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">to {new Date(booking.checkOut).toLocaleDateString()}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>{booking.pax}</TableCell>
                        <TableCell>
                          {booking.confirmationNo ? (
                            <span className="font-mono text-sm">{booking.confirmationNo}</span>
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.depositStatus} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
