import { Link, useLocation } from "wouter";
import { Plane, BarChart3, Building, Route, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Suppliers", href: "/suppliers", icon: Building },
  { name: "Tours", href: "/tours", icon: Route },
  { name: "Bookings", href: "/bookings", icon: CalendarCheck },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border flex-shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-foreground flex items-center">
          <Plane className="text-primary mr-2 w-5 h-5" />
          TourOps
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Supplier Management</p>
      </div>
      
      <nav className="px-4 pb-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-l-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <Icon className="mr-3 w-4 h-4" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
