import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExcelImportExport from "@/components/quotes/excel-import-export";
import { format } from "date-fns";

interface QuoteScheduleRow {
  id: string;
  quoteNumber: string;
  clientName: string;
  agentName: string;
  tourType: 'FIT' | 'Group';
  departureDate: string;
  returnDate: string;
  paxCount: number;
  quoteDate: string;
  validUntil: string;
  status: 'Pending' | 'Confirmed' | 'Not Accepted' | 'Requote Requested';
  totalAmount: number;
  currency: string;
  consultant: string;
  notes: string;
  createdAt: string;
}

const statusColors = {
  'Pending': 'default',
  'Confirmed': 'default',
  'Not Accepted': 'destructive',
  'Requote Requested': 'secondary'
} as const;

const statusIcons = {
  'Pending': Clock,
  'Confirmed': CheckCircle,
  'Not Accepted': XCircle,
  'Requote Requested': AlertCircle
} as const;

export default function QuoteSchedule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tourTypeFilter, setTourTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('schedule');
  const queryClient = useQueryClient();

  // Mock data - in real app this would come from API
  const { data: quotes = [], isLoading } = useQuery<QuoteScheduleRow[]>({
    queryKey: ["quote-schedule"],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          id: "1",
          quoteNumber: "2025001",
          clientName: "Borcherds Group",
          agentName: "Travel Agent Co",
          tourType: "Group",
          departureDate: "2025-10-10",
          returnDate: "2025-10-25",
          paxCount: 13,
          quoteDate: "2025-08-15",
          validUntil: "2025-09-15",
          status: "Confirmed",
          totalAmount: 45000,
          currency: "ZAR",
          consultant: "John Smith",
          notes: "Deposit received",
          createdAt: "2025-08-15T10:00:00Z"
        },
        {
          id: "2",
          quoteNumber: "2025002",
          clientName: "Individual Traveler",
          agentName: "Direct",
          tourType: "FIT",
          departureDate: "2025-11-05",
          returnDate: "2025-11-12",
          paxCount: 2,
          quoteDate: "2025-08-20",
          validUntil: "2025-09-20",
          status: "Pending",
          totalAmount: 8500,
          currency: "ZAR",
          consultant: "Jane Doe",
          notes: "Waiting for response",
          createdAt: "2025-08-20T14:30:00Z"
        }
      ];
    }
  });

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    const matchesTourType = tourTypeFilter === 'all' || quote.tourType === tourTypeFilter;
    
    return matchesSearch && matchesStatus && matchesTourType;
  });

  const handleImport = (data: QuoteScheduleRow[]) => {
    // Here you would call the API to import the data
    console.log("Importing quotes:", data);
    queryClient.invalidateQueries({ queryKey: ["quote-schedule"] });
  };

  const handleExport = () => {
    // Export functionality is handled in the ExcelImportExport component
    console.log("Exporting quotes");
  };

  const getDaysUntilValid = (validUntil: string) => {
    const today = new Date();
    const validDate = new Date(validUntil);
    const diffTime = validDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return "text-red-600";
    if (days <= 7) return "text-orange-600";
    if (days <= 30) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quote Schedule</h1>
        <div className="flex space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedule">Quote Schedule</TabsTrigger>
          <TabsTrigger value="fit">FIT Quotes</TabsTrigger>
          <TabsTrigger value="group">Group Quotes</TabsTrigger>
          <TabsTrigger value="excel">Excel Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search quotes, clients, agents..."
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
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Not Accepted">Not Accepted</SelectItem>
                    <SelectItem value="Requote Requested">Requote Requested</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tourTypeFilter} onValueChange={setTourTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tour Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="FIT">FIT</SelectItem>
                    <SelectItem value="Group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quote Schedule Table */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Schedule ({filteredQuotes.length} quotes)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Pax</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        Loading quotes...
                      </TableCell>
                    </TableRow>
                  ) : filteredQuotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                        No quotes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuotes.map((quote) => {
                      const StatusIcon = statusIcons[quote.status];
                      const daysUntilValid = getDaysUntilValid(quote.validUntil);
                      
                      return (
                        <TableRow key={quote.id}>
                          <TableCell className="font-mono">{quote.quoteNumber}</TableCell>
                          <TableCell>{quote.clientName}</TableCell>
                          <TableCell>{quote.agentName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{quote.tourType}</Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(quote.departureDate), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>{quote.paxCount}</TableCell>
                          <TableCell>
                            {quote.currency} {quote.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="h-4 w-4" />
                              <Badge variant={statusColors[quote.status]}>
                                {quote.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{format(new Date(quote.validUntil), "MMM dd, yyyy")}</span>
                              <span className={`text-xs ${getUrgencyColor(daysUntilValid)}`}>
                                {daysUntilValid < 0 ? `${Math.abs(daysUntilValid)} days ago` : 
                                 daysUntilValid === 0 ? "Today" : 
                                 `${daysUntilValid} days`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{quote.consultant}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FIT Quote Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                FIT quotes will be displayed here with specific filtering and management options.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Group Quote Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Group quotes will be displayed here with specific filtering and management options.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="excel" className="space-y-4">
          <ExcelImportExport 
            onImport={handleImport}
            onExport={handleExport}
            quotes={quotes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
