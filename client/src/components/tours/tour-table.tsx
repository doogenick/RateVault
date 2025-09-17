import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Tour } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/ui/status-badge";
import { Route, Search, Plus, Edit, Trash2, Users, User, Eye } from "lucide-react";
import TourForm from "./tour-form";

interface TourTableProps {
  tours: Tour[];
}

export default function TourTable({ tours }: TourTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteTourMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tours/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: "Tour deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to delete tour",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const filteredTours = tours.filter((tour) => {
    const matchesSearch = tour.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.quoteRef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || tour.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statuses = Array.from(new Set(tours.map(t => t.status)));

  const handleDelete = (id: string, clientName: string) => {
    if (confirm(`Are you sure you want to delete the tour for ${clientName}?`)) {
      deleteTourMutation.mutate(id);
    }
  };

  const handleViewDetails = (tourId: string) => {
    setLocation(`/tours/${tourId}`);
  };

  const getTourTypeIcon = (tourType: string) => {
    return tourType === "Group" ? Users : User;
  };

  const getDaysUntilDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search tours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
              data-testid="search-tours"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="filter-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setIsFormOpen(true)} data-testid="button-create-tour">
          <Plus className="mr-2 w-4 h-4" />
          Create Tour
        </Button>
      </div>

      {filteredTours.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Route className="mx-auto w-12 h-12 mb-4" />
          <p>No tours found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Tour Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Deposit Due</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTours.map((tour) => {
                const TourIcon = getTourTypeIcon(tour.tourType);
                const releaseDays = getDaysUntilDate(tour.releaseDate);
                const depositDays = getDaysUntilDate(tour.depositDue);
                
                return (
                  <TableRow key={tour.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-foreground">{tour.clientName}</div>
                        <div className="text-sm text-muted-foreground">{tour.quoteRef}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <TourIcon className="mr-2 w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{tour.tourType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{new Date(tour.startDate).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">to {new Date(tour.endDate).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tour.status} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {tour.releaseDate ? (
                        <div>
                          <div>{new Date(tour.releaseDate).toLocaleDateString()}</div>
                          {releaseDays !== null && releaseDays <= 7 && releaseDays > 0 && (
                            <div className="text-red-600 text-xs font-medium">
                              {releaseDays} days left
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {tour.depositDue ? (
                        <div>
                          <div>{new Date(tour.depositDue).toLocaleDateString()}</div>
                          {depositDays !== null && depositDays <= 3 && depositDays > 0 && (
                            <div className="text-yellow-600 text-xs font-medium">
                              Due in {depositDays} days
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(tour.id)}
                          data-testid={`button-view-${tour.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-edit-${tour.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tour.id, tour.clientName)}
                          data-testid={`button-delete-${tour.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TourForm open={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
