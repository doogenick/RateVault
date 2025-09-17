import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTourSchema, type InsertTour } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface TourFormProps {
  open: boolean;
  onClose: () => void;
}

const tourTypes = ["FIT", "Group"];
const statuses = ["Quote", "Provisional", "Confirmed", "Cancelled"];

export default function TourForm({ open, onClose }: TourFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTour>({
    resolver: zodResolver(insertTourSchema),
    defaultValues: {
      clientName: "",
      quoteRef: "",
      tourType: "",
      startDate: "",
      endDate: "",
      status: "",
      notes: "",
    },
  });

  const createTourMutation = useMutation({
    mutationFn: async (data: InsertTour) => {
      const response = await apiRequest("POST", "/api/tours", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: "Tour created successfully" });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to create tour",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTour) => {
    createTourMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Tour</DialogTitle>
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
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTourMutation.isPending}
                data-testid="button-create-tour"
              >
                {createTourMutation.isPending ? "Creating..." : "Create Tour"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
