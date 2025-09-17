import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Supplier, Rate } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building, Search, Plus, Edit, Trash2, DollarSign, Eye } from "lucide-react";
import SupplierForm from "./supplier-form";
import RateManagement from "./rate-management";

interface SupplierTableProps {
  suppliers: Supplier[];
}

export default function SupplierTable({ suppliers }: SupplierTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get rates count for each supplier
  const { data: allRates = [] } = useQuery<Rate[]>({
    queryKey: ["/api/rates"],
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({ title: "Supplier deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to delete supplier",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesRegion = regionFilter === "all" || supplier.region === regionFilter;
    const matchesService = serviceFilter === "all" || supplier.serviceType === serviceFilter;

    return matchesSearch && matchesRegion && matchesService;
  });

  const regions = Array.from(new Set(suppliers.map(s => s.region)));
  const serviceTypes = Array.from(new Set(suppliers.map(s => s.serviceType)));

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case "Accommodation": return "bg-blue-100 text-blue-800";
      case "Activity": return "bg-green-100 text-green-800";
      case "Transfer": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteSupplierMutation.mutate(id);
    }
  };

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailOpen(true);
  };

  const getRatesCount = (supplierId: string) => {
    return allRates.filter(rate => rate.supplierId === supplierId).length;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
              data-testid="search-suppliers"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
          
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-40" data-testid="filter-region">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-40" data-testid="filter-service">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {serviceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setIsFormOpen(true)} data-testid="button-add-supplier">
          <Plus className="mr-2 w-4 h-4" />
          Add Supplier
        </Button>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Building className="mx-auto w-12 h-12 mb-4" />
          <p>No suppliers found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rates</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building className="text-primary w-5 h-5" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">{supplier.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {supplier.serviceType}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{supplier.region}</TableCell>
                  <TableCell>
                    <Badge className={`px-2 py-1 text-xs font-medium rounded-md ${getServiceTypeColor(supplier.serviceType)}`}>
                      {supplier.serviceType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {supplier.contactName ? (
                      <div>
                        <div className="text-foreground">{supplier.contactName}</div>
                        <div className="text-muted-foreground">{supplier.contactEmail}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No contact info</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    <div className="flex items-center">
                      <DollarSign className="mr-1 text-green-600 w-4 h-4" />
                      <span className="text-muted-foreground">
                        {getRatesCount(supplier.id)} rate{getRatesCount(supplier.id) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(supplier)}
                        data-testid={`button-view-${supplier.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-edit-${supplier.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(supplier.id, supplier.name)}
                        data-testid={`button-delete-${supplier.id}`}
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

      <SupplierForm open={isFormOpen} onClose={() => setIsFormOpen(false)} />

      {/* Supplier Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
          </DialogHeader>
          
          {selectedSupplier && (
            <div className="space-y-6">
              {/* Supplier Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{selectedSupplier.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-muted-foreground w-20">Region:</span>
                      <span>{selectedSupplier.region}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-muted-foreground w-20">Type:</span>
                      <Badge className={`px-2 py-1 text-xs font-medium rounded-md ${getServiceTypeColor(selectedSupplier.serviceType)}`}>
                        {selectedSupplier.serviceType}
                      </Badge>
                    </div>
                    {selectedSupplier.contactName && (
                      <div className="flex items-center">
                        <span className="font-medium text-muted-foreground w-20">Contact:</span>
                        <span>{selectedSupplier.contactName}</span>
                      </div>
                    )}
                    {selectedSupplier.contactEmail && (
                      <div className="flex items-center">
                        <span className="font-medium text-muted-foreground w-20">Email:</span>
                        <span>{selectedSupplier.contactEmail}</span>
                      </div>
                    )}
                    {selectedSupplier.phone && (
                      <div className="flex items-center">
                        <span className="font-medium text-muted-foreground w-20">Phone:</span>
                        <span>{selectedSupplier.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedSupplier.notes && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.notes}</p>
                  </div>
                )}
              </div>

              {/* Rate Management */}
              <RateManagement 
                supplierId={selectedSupplier.id} 
                supplierName={selectedSupplier.name} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
