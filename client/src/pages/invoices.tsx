import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, DollarSign, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoiceNumber: string;
  tourId?: string;
  agentId?: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  currency: string;
  exchangeRate?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  tour?: {
    id: string;
    clientName: string;
    tourType: string;
  };
  agent?: {
    id: string;
    companyName: string;
    contactPerson?: string;
  };
  items?: {
    id: string;
    description: string;
    quantity: number;
    unitPrice?: string;
    totalPrice?: string;
    notes?: string;
  }[];
}

const statusColors = {
  pending: "secondary",
  paid: "default",
  overdue: "destructive",
  cancelled: "destructive"
} as const;

const statusLabels = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled"
} as const;

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await fetch("/api/invoices");
      if (!response.ok) throw new Error("Failed to fetch invoices");
      return response.json();
    }
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete invoice");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Invoice deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete invoice", variant: "destructive" });
    }
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.tour?.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.agent?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && statusFilter !== "paid";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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
                <TableHead>Invoice Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.tour?.clientName || "N/A"}</TableCell>
                    <TableCell>{invoice.agent?.companyName || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className={isOverdue(invoice.dueDate) ? "text-red-600" : ""}>
                          {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>{invoice.currency} {parseFloat(invoice.totalAmount).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[invoice.status]}>
                        {statusLabels[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.id)}
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

      {/* Invoice Details Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Invoice Number</label>
                  <p className="text-sm text-gray-600">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={statusColors[selectedInvoice.status]}>
                    {statusLabels[selectedInvoice.status]}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <p className="text-sm text-gray-600">{selectedInvoice.tour?.clientName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Agent</label>
                  <p className="text-sm text-gray-600">{selectedInvoice.agent?.companyName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Invoice Date</label>
                  <p className="text-sm text-gray-600">{format(new Date(selectedInvoice.invoiceDate), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <p className="text-sm text-gray-600">{format(new Date(selectedInvoice.dueDate), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Amount</label>
                  <p className="text-sm text-gray-600">{selectedInvoice.currency} {parseFloat(selectedInvoice.totalAmount).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Exchange Rate</label>
                  <p className="text-sm text-gray-600">{selectedInvoice.exchangeRate || "N/A"}</p>
                </div>
                {selectedInvoice.paymentDate && (
                  <div>
                    <label className="text-sm font-medium">Payment Date</label>
                    <p className="text-sm text-gray-600">{format(new Date(selectedInvoice.paymentDate), "MMM dd, yyyy")}</p>
                  </div>
                )}
                {selectedInvoice.paymentMethod && (
                  <div>
                    <label className="text-sm font-medium">Payment Method</label>
                    <p className="text-sm text-gray-600">{selectedInvoice.paymentMethod}</p>
                  </div>
                )}
                {selectedInvoice.paymentReference && (
                  <div>
                    <label className="text-sm font-medium">Payment Reference</label>
                    <p className="text-sm text-gray-600">{selectedInvoice.paymentReference}</p>
                  </div>
                )}
              </div>

              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Invoice Items</label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.unitPrice ? `${selectedInvoice.currency} ${parseFloat(item.unitPrice).toLocaleString()}` : "N/A"}
                          </TableCell>
                          <TableCell>
                            {item.totalPrice ? `${selectedInvoice.currency} ${parseFloat(item.totalPrice).toLocaleString()}` : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {selectedInvoice.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Invoice creation form will be implemented here.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
