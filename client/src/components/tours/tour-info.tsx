import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTourSchema, type InsertTour, type Tour } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, Users, FileText, DollarSign, AlertCircle } from "lucide-react";

interface TourInfoProps {
  tour: Tour;
}

const tourTypes = ["FIT", "Group"];
const statuses = ["Quote", "Provisional", "Confirmed", "Cancelled"];

export default function TourInfo({ tour }: TourInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTour>({
    resolver: zodResolver(insertTourSchema),
    defaultValues: {
      clientName: tour.clientName,
      quoteRef: tour.quoteRef,
      tourType: tour.tourType,
      startDate: tour.startDate,
      endDate: tour.endDate,
      status: tour.status,
      depositDue: tour.depositDue || "",
      releaseDate: tour.releaseDate || "",
      finalPayment: tour.finalPayment || "",
      notes: tour.notes || "",
      excelQuoteUrl: tour.excelQuoteUrl || "",
    },
  });

  const updateTourMutation = useMutation({
    mutationFn: async (data: InsertTour) => {
      const response = await apiRequest("PATCH", `/api/tours/${tour.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tours/${tour.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: "Tour updated successfully" });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Failed to update tour",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTour) => {
    updateTourMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-100 text-green-800";
      case "Provisional": return "bg-yellow-100 text-yellow-800";
      case "Quote": return "bg-blue-100 text-blue-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const releaseDays = getDaysUntilDate(tour.releaseDate);
  const depositDays = getDaysUntilDate(tour.depositDue);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 w-5 h-5" />
            Tour Information
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            data-testid="button-edit-tour"
          >
            <Edit className="mr-2 w-4 h-4" />
            Edit Tour
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-3">Client Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-muted-foreground w-24">Client:</span>
                <span>{tour.clientName}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-muted-foreground w-24">Quote Ref:</span>
                <span className="font-mono">{tour.quoteRef}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-muted-foreground w-24">Type:</span>
                <div className="flex items-center">
                  <Users className="mr-1 w-4 h-4 text-muted-foreground" />
                  <span>{tour.tourType}</span>
                  <span className="text-muted-foreground ml-1">
                    ({tour.tourType === "FIT" ? "≤8 pax" : ">8 pax"})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Tour Dates</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-muted-foreground w-24">Start:</span>
                <span>{new Date(tour.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-muted-foreground w-24">End:</span>
                <span>{new Date(tour.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-muted-foreground w-24">Duration:</span>
                <span>
                  {Math.ceil((new Date(tour.endDate).getTime() - new Date(tour.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Important Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-3">Status & Deadlines</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-muted-foreground w-24">Status:</span>
                <Badge className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(tour.status)}`}>
                  {tour.status}
                </Badge>
              </div>
              
              {tour.depositDue && (
                <div className="flex items-center">
                  <span className="font-medium text-muted-foreground w-24">Deposit Due:</span>
                  <div className="flex items-center">
                    <span>{new Date(tour.depositDue).toLocaleDateString()}</span>
                    {depositDays !== null && depositDays <= 3 && depositDays > 0 && (
                      <AlertCircle className="ml-2 w-4 h-4 text-yellow-600" />
                    )}
                    {depositDays !== null && depositDays <= 3 && depositDays > 0 && (
                      <span className="text-yellow-600 text-xs font-medium ml-1">
                        Due in {depositDays} days
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {tour.releaseDate && (
                <div className="flex items-center">
                  <span className="font-medium text-muted-foreground w-24">Release Date:</span>
                  <div className="flex items-center">
                    <span>{new Date(tour.releaseDate).toLocaleDateString()}</span>
                    {releaseDays !== null && releaseDays <= 7 && releaseDays > 0 && (
                      <AlertCircle className="ml-2 w-4 h-4 text-red-600" />
                    )}
                    {releaseDays !== null && releaseDays <= 7 && releaseDays > 0 && (
                      <span className="text-red-600 text-xs font-medium ml-1">
                        {releaseDays} days left
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {tour.finalPayment && (
                <div className="flex items-center">
                  <span className="font-medium text-muted-foreground w-24">Final Payment:</span>
                  <span>{new Date(tour.finalPayment).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Files & Notes</h4>
            <div className="space-y-2 text-sm">
              {tour.excelQuoteUrl ? (
                <div className="flex items-center">
                  <FileText className="mr-2 w-4 h-4 text-green-600" />
                  <span className="text-green-600">Excel quote attached</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <FileText className="mr-2 w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">No Excel quote</span>
                </div>
              )}
              
              {tour.notes && (
                <div>
                  <span className="font-medium text-muted-foreground">Notes:</span>
                  <p className="text-muted-foreground mt-1">{tour.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Edit Tour Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tour</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client name" {...field} data-testid="input-client-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quoteRef"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote Reference *</FormLabel>
                      <FormControl>
                        <Input placeholder="QT-2024-XXX" {...field} data-testid="input-quote-ref" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tourType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tour Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tour-type">
                            <SelectValue placeholder="Select tour type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tourTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type} {type === "FIT" ? "(≤8 pax)" : "(>8 pax)"}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
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
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depositDue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-deposit-due" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="releaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Release Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-release-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finalPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Payment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-final-payment" />
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
                        placeholder="Additional notes about the tour..."
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
                  onClick={() => setIsEditing(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateTourMutation.isPending}
                  data-testid="button-save-tour"
                >
                  {updateTourMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
