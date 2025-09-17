import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SupplierTable from "@/components/suppliers/supplier-table";
import type { Supplier } from "@shared/schema";

export default function Suppliers() {
  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Suppliers" subtitle="Manage supplier contacts and rate sheets" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <SupplierTable suppliers={suppliers} />
          </div>
        </main>
      </div>
    </div>
  );
}
