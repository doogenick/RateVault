import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Suppliers from "@/pages/suppliers";
import Tours from "@/pages/tours";
import TourDetail from "@/pages/tour-detail";
import Bookings from "@/pages/bookings";
import Quotes from "@/pages/quotes";
import OvernightLists from "@/pages/overnight-lists";
import Checklists from "@/pages/checklists";
import Invoices from "@/pages/invoices";
import Agents from "@/pages/agents";
import TourOperations from "@/pages/tour-operations";
import BookingManagement from "@/pages/booking-management";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/tours" component={Tours} />
      <Route path="/tours/:id" component={TourDetail} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/quotes" component={Quotes} />
      <Route path="/overnight-lists" component={OvernightLists} />
      <Route path="/checklists" component={Checklists} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/agents" component={Agents} />
      <Route path="/tour-operations" component={TourOperations} />
      <Route path="/booking-management" component={BookingManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
