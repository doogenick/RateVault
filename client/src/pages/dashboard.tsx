import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/ui/stats-card";
import SupplierTable from "@/components/suppliers/supplier-table";
import { Building, CalendarCheck, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { Supplier, Tour } from "@shared/schema";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("suppliers");

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: tours = [] } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
  });

  const confirmedTours = tours.filter(tour => tour.status === "Confirmed").length;
  const provisionalTours = tours.filter(tour => tour.status === "Provisional").length;
  
  // Calculate urgent actions (tours with approaching release dates)
  const urgentActions = tours.filter(tour => {
    if (!tour.releaseDate) return false;
    const releaseDate = new Date(tour.releaseDate);
    const today = new Date();
    const diffTime = releaseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }).length;

  const recentTours = tours
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" subtitle="Manage suppliers, tours, and bookings" />
        
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Suppliers"
              value={suppliers.length.toString()}
              icon={Building}
              color="blue"
              data-testid="stat-suppliers"
            />
            <StatsCard
              title="Confirmed Tours"
              value={confirmedTours.toString()}
              icon={CalendarCheck}
              color="green"
              data-testid="stat-confirmed"
            />
            <StatsCard
              title="Provisional"
              value={provisionalTours.toString()}
              icon={Clock}
              color="yellow"
              data-testid="stat-provisional"
            />
            <StatsCard
              title="Urgent Actions"
              value={urgentActions.toString()}
              icon={AlertTriangle}
              color="red"
              data-testid="stat-urgent"
            />
          </div>

          {/* Main Content Tabs */}
          <div className="bg-card rounded-lg border border-border">
            <div className="border-b border-border">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  className={`tab-${activeTab === 'suppliers' ? 'active' : 'inactive'} border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap`}
                  onClick={() => setActiveTab('suppliers')}
                  data-testid="tab-suppliers"
                >
                  Suppliers
                </button>
                <button
                  className={`tab-${activeTab === 'tours' ? 'active' : 'inactive'} border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap`}
                  onClick={() => setActiveTab('tours')}
                  data-testid="tab-tours"
                >
                  Tours & Bookings
                </button>
                <button
                  className={`tab-${activeTab === 'activity' ? 'active' : 'inactive'} border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap`}
                  onClick={() => setActiveTab('activity')}
                  data-testid="tab-activity"
                >
                  Recent Activity
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'suppliers' && <SupplierTable suppliers={suppliers} />}
              {activeTab === 'tours' && (
                <div className="text-center py-8 text-muted-foreground">
                  Tours and bookings management coming soon...
                </div>
              )}
              {activeTab === 'activity' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Tours */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Recent Tours</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {recentTours.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No recent tours found</p>
                      ) : (
                        recentTours.map((tour) => (
                          <div key={tour.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <CalendarCheck className="text-primary w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{tour.clientName}</p>
                                <p className="text-xs text-muted-foreground">{tour.quoteRef}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`status-badge status-${tour.status.toLowerCase()}`}>
                                {tour.status}
                              </span>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(tour.startDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Urgent Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Urgent Actions</h3>
                      <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-md">
                        {urgentActions} items
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {urgentActions === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No urgent actions required</p>
                      ) : (
                        tours
                          .filter(tour => {
                            if (!tour.releaseDate) return false;
                            const releaseDate = new Date(tour.releaseDate);
                            const today = new Date();
                            const diffTime = releaseDate.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays <= 7 && diffDays > 0;
                          })
                          .map((tour) => {
                            const releaseDate = new Date(tour.releaseDate!);
                            const today = new Date();
                            const diffTime = releaseDate.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            return (
                              <div key={tour.id} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Clock className="text-red-600 w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">Release date approaching</p>
                                  <p className="text-xs text-muted-foreground">{tour.clientName} - Release by {releaseDate.toLocaleDateString()}</p>
                                  <p className="text-xs text-red-600 font-medium mt-1">{diffDays} days remaining</p>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
