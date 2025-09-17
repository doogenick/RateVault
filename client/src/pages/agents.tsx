import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Building2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Agent {
  id: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  country?: string;
  region?: string;
  commissionRate?: string;
  paymentTerms?: string;
  isActive: string;
  createdAt: string;
}

export default function Agents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await fetch("/api/agents");
      if (!response.ok) throw new Error("Failed to fetch agents");
      return response.json();
    }
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete agent");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({ title: "Agent deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete agent", variant: "destructive" });
    }
  });

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.region?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && agent.isActive === "true") ||
                         (statusFilter === "inactive" && agent.isActive === "false");
    return matchesSearch && matchesStatus;
  });

  const handleDeleteAgent = (id: string) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      deleteAgentMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agents</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search agents..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading agents...
                  </TableCell>
                </TableRow>
              ) : filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No agents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{agent.companyName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{agent.contactPerson || "N/A"}</TableCell>
                    <TableCell>
                      {agent.email ? (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{agent.email}</span>
                        </div>
                      ) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {agent.phone ? (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{agent.phone}</span>
                        </div>
                      ) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {agent.country ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{agent.country}</span>
                        </div>
                      ) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {agent.commissionRate ? `${agent.commissionRate}%` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={agent.isActive === "true" ? "default" : "secondary"}>
                        {agent.isActive === "true" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAgent(agent)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAgent(agent.id)}
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

      {/* Agent Details Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agent Details - {selectedAgent?.companyName}</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <p className="text-sm text-gray-600">{selectedAgent.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={selectedAgent.isActive === "true" ? "default" : "secondary"}>
                    {selectedAgent.isActive === "true" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Person</label>
                  <p className="text-sm text-gray-600">{selectedAgent.contactPerson || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-gray-600">{selectedAgent.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-gray-600">{selectedAgent.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <p className="text-sm text-gray-600">{selectedAgent.country || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Region</label>
                  <p className="text-sm text-gray-600">{selectedAgent.region || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Commission Rate</label>
                  <p className="text-sm text-gray-600">{selectedAgent.commissionRate ? `${selectedAgent.commissionRate}%` : "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Terms</label>
                  <p className="text-sm text-gray-600">{selectedAgent.paymentTerms || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created At</label>
                  <p className="text-sm text-gray-600">{format(new Date(selectedAgent.createdAt), "MMM dd, yyyy")}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Agent Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Agent creation form will be implemented here.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Agent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
