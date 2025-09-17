import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BookingChecklist {
  id: string;
  tourId: string;
  checklistType: "pre_tour" | "during_tour" | "post_tour" | "booking" | "payment" | "supplier";
  itemName: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high" | "critical";
  notes?: string;
  createdAt: string;
  tour?: {
    id: string;
    clientName: string;
    tourType: string;
  };
}

const priorityColors = {
  low: "secondary",
  medium: "default",
  high: "destructive",
  critical: "destructive"
} as const;

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
} as const;

const typeLabels = {
  pre_tour: "Pre-Tour",
  during_tour: "During Tour",
  post_tour: "Post-Tour",
  booking: "Booking",
  payment: "Payment",
  supplier: "Supplier"
} as const;

const priorityIcons = {
  low: Circle,
  medium: Clock,
  high: AlertCircle,
  critical: AlertCircle
} as const;

export default function Checklists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [completedFilter, setCompletedFilter] = useState<string>("all");
  const [selectedChecklist, setSelectedChecklist] = useState<BookingChecklist | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: checklists = [], isLoading } = useQuery<BookingChecklist[]>({
    queryKey: ["booking-checklists"],
    queryFn: async () => {
      const response = await fetch("/api/booking-checklists");
      if (!response.ok) throw new Error("Failed to fetch booking checklists");
      return response.json();
    }
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const response = await fetch(`/api/booking-checklists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted })
      });
      if (!response.ok) throw new Error("Failed to update checklist item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-checklists"] });
      toast({ title: "Checklist item updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update checklist item", variant: "destructive" });
    }
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/booking-checklists/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete checklist item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-checklists"] });
      toast({ title: "Checklist item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete checklist item", variant: "destructive" });
    }
  });

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch = checklist.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.tour?.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || checklist.checklistType === typeFilter;
    const matchesPriority = priorityFilter === "all" || checklist.priority === priorityFilter;
    const matchesCompleted = completedFilter === "all" || 
                           (completedFilter === "completed" && checklist.isCompleted) ||
                           (completedFilter === "pending" && !checklist.isCompleted);
    return matchesSearch && matchesType && matchesPriority && matchesCompleted;
  });

  const handleToggleComplete = (id: string, isCompleted: boolean) => {
    toggleCompleteMutation.mutate({ id, isCompleted: !isCompleted });
  };

  const handleDeleteChecklist = (id: string) => {
    if (confirm("Are you sure you want to delete this checklist item?")) {
      deleteChecklistMutation.mutate(id);
    }
  };

  const getPriorityIcon = (priority: keyof typeof priorityIcons) => {
    const Icon = priorityIcons[priority];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Booking Checklists</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Checklist Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search checklist items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pre_tour">Pre-Tour</SelectItem>
                <SelectItem value="during_tour">During Tour</SelectItem>
                <SelectItem value="post_tour">Post-Tour</SelectItem>
                <SelectItem value="booking">Booking</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={completedFilter} onValueChange={setCompletedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading checklist items...
                  </TableCell>
                </TableRow>
              ) : filteredChecklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No checklist items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredChecklists.map((checklist) => (
                  <TableRow key={checklist.id}>
                    <TableCell className="font-medium">{checklist.itemName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {typeLabels[checklist.checklistType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(checklist.priority)}
                        <Badge variant={priorityColors[checklist.priority]}>
                          {priorityLabels[checklist.priority]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {checklist.dueDate ? format(new Date(checklist.dueDate), "MMM dd, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={checklist.isCompleted}
                          onCheckedChange={() => handleToggleComplete(checklist.id, checklist.isCompleted)}
                        />
                        <span className={checklist.isCompleted ? "text-green-600" : "text-gray-600"}>
                          {checklist.isCompleted ? "Completed" : "Pending"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedChecklist(checklist)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChecklist(checklist.id)}
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

      {/* Checklist Details Dialog */}
      <Dialog open={!!selectedChecklist} onOpenChange={() => setSelectedChecklist(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Checklist Item Details</DialogTitle>
          </DialogHeader>
          {selectedChecklist && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Item Name</label>
                  <p className="text-sm text-gray-600">{selectedChecklist.itemName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Badge variant="outline">
                    {typeLabels[selectedChecklist.checklistType]}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(selectedChecklist.priority)}
                    <Badge variant={priorityColors[selectedChecklist.priority]}>
                      {priorityLabels[selectedChecklist.priority]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedChecklist.isCompleted}
                      onCheckedChange={() => handleToggleComplete(selectedChecklist.id, selectedChecklist.isCompleted)}
                    />
                    <span className={selectedChecklist.isCompleted ? "text-green-600" : "text-gray-600"}>
                      {selectedChecklist.isCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <p className="text-sm text-gray-600">
                    {selectedChecklist.dueDate ? format(new Date(selectedChecklist.dueDate), "MMM dd, yyyy") : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Completed At</label>
                  <p className="text-sm text-gray-600">
                    {selectedChecklist.completedAt ? format(new Date(selectedChecklist.completedAt), "MMM dd, yyyy HH:mm") : "N/A"}
                  </p>
                </div>
              </div>
              
              {selectedChecklist.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-gray-600">{selectedChecklist.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Checklist Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Checklist Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Checklist item creation form will be implemented here.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
