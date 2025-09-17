import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRateSchema, type InsertRate, type Rate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign, Calendar, Users, Search } from "lucide-react";

interface RateManagementProps {
  supplierId: string;
  supplierName: string;
}

const boardBasisOptions = ["BB", "HB", "FB", "AI", "RO"];
const currencies = ["USD", "EUR", "ZAR", "GBP", "AUD"];

export default function RateManagement({ supplierId, supplierName }: RateManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rates = [], isLoading } = useQuery<Rate[]>({
    queryKey: [`/api/suppliers/${supplierId}/rates`],
  });

  const form = useForm<InsertRate>({
    resolver: zodResolver(insertRateSchema),
    defaultValues: {
      supplierId,
      season: "",
      validFrom: "",
      validTo: "",
      roomType: "",
      boardBasis: "",
      pricePerPerson: "",
      currency: "USD",
      notes: "",
    },
  });

  const createRateMutation = useMutation({
    mutationFn: async (data: InsertRate) => {
      const response = await apiRequest("POST", "/api/rates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplierId}/rates`] });
      toast({ title: "Rate created successfully" });
      form.reset();
      setIsFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to create rate",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertRate> }) => {
      const response = await apiRequest("PATCH", `/api/rates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplierId}/rates`] });
      toast({ title: "Rate updated successfully" });
      form.reset();
      setEditingRate(null);
      setIsFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to update rate",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteRateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/rates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplierId}/rates`] });
      toast({ title: "Rate deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to delete rate",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (rate: Rate) => {
    setEditingRate(rate);
    form.reset({
      supplierId: rate.supplierId,
      season: rate.season,
      validFrom: rate.validFrom,
      validTo: rate.validTo,
      roomType: rate.roomType || "",
      boardBasis: rate.boardBasis || "",
      pricePerPerson: rate.pricePerPerson,
      currency: rate.currency,
      notes: rate.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, season: string) => {
    if (confirm(`Are you sure you want to delete the ${season} rate?`)) {
      deleteRateMutation.mutate(id);
    }
  };

  const onSubmit = (data: InsertRate) => {
    if (editingRate) {
      updateRateMutation.mutate({ id: editingRate.id, data });
    } else {
      createRateMutation.mutate(data);
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingRate(null);
    form.reset();
  };

  const getSeasonColor = (season: string) => {
    if (season.toLowerCase().includes("high")) return "bg-red-100 text-red-800";
    if (season.toLowerCase().includes("low")) return "bg-green-100 text-green-800";
    if (season.toLowerCase().includes("shoulder")) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const isRateActive = (validFrom: string, validTo: string) => {
    const today = new Date();
    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);
    return today >= fromDate && today <= toDate;
  };

  const filteredRates = rates.filter((rate) => {
    const matchesSearch = 
      rate.season.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.roomType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.boardBasis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeason = seasonFilter === "all" || rate.season === seasonFilter;
    
    const isActive = isRateActive(rate.validFrom, rate.validTo);
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && isActive) ||
      (statusFilter === "inactive" && !isActive);

    return matchesSearch && matchesSeason && matchesStatus;
  });

  const seasons = Array.from(new Set(rates.map(r => r.season)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Rate Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage rates for {supplierName}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} data-testid="button-add-rate">
          <Plus className="mr-2 w-4 h-4" />
          Add Rate
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search rates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
            data-testid="search-rates"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        </div>
        
        <Select value={seasonFilter} onValueChange={setSeasonFilter}>
          <SelectTrigger className="w-40" data-testid="filter-season">
            <SelectValue placeholder="All Seasons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            {seasons.map((season) => (
              <SelectItem key={season} value={season}>
                {season}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="filter-status">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rates Table */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="mx-auto w-8 h-8 mb-2" />
          <p>Loading rates...</p>
        </div>
      ) : filteredRates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="mx-auto w-12 h-12 mb-4" />
          <p>No rates found</p>
          <p className="text-sm">Add your first rate to get started</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Season</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Room Type</TableHead>
                <TableHead>Board Basis</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.map((rate) => {
                const isActive = isRateActive(rate.validFrom, rate.validTo);
                return (
                  <TableRow key={rate.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Badge className={`px-2 py-1 text-xs font-medium rounded-md ${getSeasonColor(rate.season)}`}>
                        {rate.season}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center">
                        <Calendar className="mr-1 w-4 h-4 text-muted-foreground" />
                        <div>
                          <div>{new Date(rate.validFrom).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">to {new Date(rate.validTo).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {rate.roomType || <span className="text-muted-foreground">Not specified</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {rate.boardBasis || <span className="text-muted-foreground">Not specified</span>}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      <div className="flex items-center">
                        <DollarSign className="mr-1 w-4 h-4 text-green-600" />
                        <span>{rate.pricePerPerson} {rate.currency}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(rate)}
                          data-testid={`button-edit-rate-${rate.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(rate.id, rate.season)}
                          data-testid={`button-delete-rate-${rate.id}`}
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

      {/* Rate Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRate ? "Edit Rate" : "Add New Rate"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., High 2025, Low 2026" {...field} data-testid="input-season" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Standard, Deluxe, Suite" {...field} data-testid="input-room-type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid From *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-valid-from" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid To *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-valid-to" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="boardBasis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Board Basis</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-board-basis">
                            <SelectValue placeholder="Select board basis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {boardBasisOptions.map((basis) => (
                            <SelectItem key={basis} value={basis}>
                              {basis}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pricePerPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Person *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field}
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Additional notes about this rate..."
                        {...field}
                        data-testid="textarea-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRateMutation.isPending || updateRateMutation.isPending}
                  data-testid="button-save-rate"
                >
                  {createRateMutation.isPending || updateRateMutation.isPending 
                    ? "Saving..." 
                    : editingRate ? "Update Rate" : "Add Rate"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
