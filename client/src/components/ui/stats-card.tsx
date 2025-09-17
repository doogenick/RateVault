import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: "blue" | "green" | "yellow" | "red";
}

const colorClasses = {
  blue: "bg-blue-100",
  green: "bg-green-100", 
  yellow: "bg-yellow-100",
  red: "bg-red-100"
};

const iconColorClasses = {
  blue: "text-blue-600",
  green: "text-green-600",
  yellow: "text-yellow-600", 
  red: "text-red-600"
};

export default function StatsCard({ title, value, icon: Icon, color, ...props }: StatsCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6" {...props}>
      <div className="flex items-center">
        <div className={`p-2 ${colorClasses[color]} rounded-lg`}>
          <Icon className={`${iconColorClasses[color]} w-5 h-5`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
