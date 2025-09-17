import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface OvernightList {
  id: string;
  tourId: string;
  dayNumber: number;
  date?: string;
  location?: string;
  accommodation?: string;
  accommodationType?: "camping" | "dorm" | "twin" | "single" | "family" | "luxury";
  paxCount?: number;
  roomConfiguration?: string;
  mealsBreakfast?: "x" | "0" | "1";
  mealsLunch?: "x" | "0" | "1";
  mealsDinner?: "x" | "0" | "1";
  activities?: string;
  supplier?: string;
  bookingReference?: string;
  status: "provisional" | "confirmed" | "waitlisted" | "alternative" | "cancelled";
  notes?: string;
  createdAt: string;
  tour?: {
    id: string;
    clientName: string;
    tourType: string;
  };
}

const statusColors = {
  provisional: "secondary",
  confirmed: "default",
  waitlisted: "destructive",
  alternative: "destructive",
  cancelled: "destructive"
} as const;

const statusLabels = {
  provisional: "Provisional",
  confirmed: "Confirmed",
  waitlisted: "Waitlisted",
  alternative: "Alternative",
  cancelled: "Cancelled"
} as const;

const accommodationTypeLabels = {
  camping: "Camping",
  dorm: "Dorm",
  twin: "Twin",
  single: "Single",
  family: "Family",
  luxury: "Luxury"
} as const;

const mealLabels = {
  x: "Not included",
  "0": "Provided by supplier",
  "1": "Provided by Nomad"
} as const;

export default function OvernightLists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedList, setSelectedList] = useState<OvernightList | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: overnightLists = [], isLoading } = useQuery<OvernightList[]>({
    queryKey: ["overnight-lists"],
    queryFn: async () => {
      const response = await fetch("/api/overnight-lists");
      if (!response.ok) throw new Error("Failed to fetch overnight lists");
      return response.json();
    }
  });

  const deleteOvernightListMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/overnight-lists/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete overnight list");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overnight-lists"] });
      toast({ title: "Overnight list deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete overnight list", variant: "destructive" });
    }
  });

  const filteredLists = overnightLists.filter(list => {
    const matchesSearch = list.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         list.accommodation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         list.tour?.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || list.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteList = (id: string) => {
    if (confirm("Are you sure you want to delete this overnight list entry?")) {
      deleteOvernightListMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Overnight Lists</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Overnight List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search overnight lists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="provisional">Provisional</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="alternative">Alternative</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Accommodation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Pax</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading overnight lists...
                  </TableCell>
                </TableRow>
              ) : filteredLists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No overnight lists found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className="font-medium">Day {list.dayNumber}</TableCell>
                    <TableCell>
                      {list.date ? format(new Date(list.date), "MMM dd") : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{list.location || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{list.accommodation || "N/A"}</TableCell>
                    <TableCell>
                      {list.accommodationType ? accommodationTypeLabels[list.accommodationType] : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{list.paxCount || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[list.status]}>
                        {statusLabels[list.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedList(list)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteList(list.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Overnight List Details Dialog */}
      <Dialog open={!!selectedList} onOpenChange={() => setSelectedList(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Overnight List Details - Day {selectedList?.dayNumber}</DialogTitle>
          </DialogHeader>
          {selectedList && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Day Number</label>
                  <p className="text-sm text-gray-600">Day {selectedList.dayNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-sm text-gray-600">
                    {selectedList.date ? format(new Date(selectedList.date), "MMM dd, yyyy") : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-sm text-gray-600">{selectedList.location || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Accommodation</label>
                  <p className="text-sm text-gray-600">{selectedList.accommodation || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Accommodation Type</label>
                  <p className="text-sm text-gray-600">
                    {selectedList.accommodationType ? accommodationTypeLabels[selectedList.accommodationType] : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Pax Count</label>
                  <p className="text-sm text-gray-600">{selectedList.paxCount || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Room Configuration</label>
                  <p className="text-sm text-gray-600">{selectedList.roomConfiguration || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={statusColors[selectedList.status]}>
                    {statusLabels[selectedList.status]}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Supplier</label>
                  <p className="text-sm text-gray-600">{selectedList.supplier || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Booking Reference</label>
                  <p className="text-sm text-gray-600">{selectedList.bookingReference || "N/A"}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Meals</label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <span className="text-xs text-gray-500">Breakfast</span>
                    <p className="text-sm">{selectedList.mealsBreakfast ? mealLabels[selectedList.mealsBreakfast] : "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Lunch</span>
                    <p className="text-sm">{selectedList.mealsLunch ? mealLabels[selectedList.mealsLunch] : "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Dinner</span>
                    <p className="text-sm">{selectedList.mealsDinner ? mealLabels[selectedList.mealsDinner] : "N/A"}</p>
                  </div>
                </div>
              </div>

              {selectedList.activities && (
                <div>
                  <label className="text-sm font-medium">Activities</label>
                  <p className="text-sm text-gray-600">{selectedList.activities}</p>
                </div>
              )}

              {selectedList.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-gray-600">{selectedList.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Overnight List Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Overnight List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Overnight list creation form will be implemented here.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
