import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TourTable from "@/components/tours/tour-table";
import type { Tour } from "@shared/schema";

export default function Tours() {
  const { data: tours = [] } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Tours" subtitle="Track FIT and Group tours with bookings" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <TourTable tours={tours} />
          </div>
        </main>
      </div>
    </div>
  );
}
