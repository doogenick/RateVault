import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Quote {
  id: string;
  quoteNumber: string;
  tourId?: string;
  agentId?: string;
  quoteDate: string;
  validUntil?: string;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  totalAmount?: string;
  currency: string;
  exchangeRate?: string;
  followUpDate?: string;
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
}

const statusColors = {
  draft: "secondary",
  sent: "default",
  accepted: "default",
  declined: "destructive",
  expired: "destructive"
} as const;

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired"
} as const;

export default function Quotes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ["quotes"],
    queryFn: async () => {
      const response = await fetch("/api/quotes");
      if (!response.ok) throw new Error("Failed to fetch quotes");
      return response.json();
    }
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete quote");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({ title: "Quote deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete quote", variant: "destructive" });
    }
  });

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.tour?.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.agent?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteQuote = (id: string) => {
    if (confirm("Are you sure you want to delete this quote?")) {
      deleteQuoteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search quotes..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
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
                <TableHead>Quote Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading quotes...
                  </TableCell>
                </TableRow>
              ) : filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No quotes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                    <TableCell>{quote.tour?.clientName || "N/A"}</TableCell>
                    <TableCell>{quote.agent?.companyName || "N/A"}</TableCell>
                    <TableCell>{format(new Date(quote.quoteDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      {quote.totalAmount ? `${quote.currency} ${parseFloat(quote.totalAmount).toLocaleString()}` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[quote.status]}>
                        {statusLabels[quote.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedQuote(quote)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuote(quote.id)}
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

      {/* Quote Details Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quote Details - {selectedQuote?.quoteNumber}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quote Number</label>
                  <p className="text-sm text-gray-600">{selectedQuote.quoteNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={statusColors[selectedQuote.status]}>
                    {statusLabels[selectedQuote.status]}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <p className="text-sm text-gray-600">{selectedQuote.tour?.clientName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Agent</label>
                  <p className="text-sm text-gray-600">{selectedQuote.agent?.companyName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Quote Date</label>
                  <p className="text-sm text-gray-600">{format(new Date(selectedQuote.quoteDate), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Valid Until</label>
                  <p className="text-sm text-gray-600">
                    {selectedQuote.validUntil ? format(new Date(selectedQuote.validUntil), "MMM dd, yyyy") : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Amount</label>
                  <p className="text-sm text-gray-600">
                    {selectedQuote.totalAmount ? `${selectedQuote.currency} ${parseFloat(selectedQuote.totalAmount).toLocaleString()}` : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Exchange Rate</label>
                  <p className="text-sm text-gray-600">{selectedQuote.exchangeRate || "N/A"}</p>
                </div>
              </div>
              {selectedQuote.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-gray-600">{selectedQuote.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Quote Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Quote creation form will be implemented here.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Quote
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
