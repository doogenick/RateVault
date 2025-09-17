import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const getStatusClass = (status: string) => {
    const normalized = status.toLowerCase().replace(/\s+/g, '-');
    switch (normalized) {
      case 'quote':
        return 'status-quote';
      case 'provisional':
        return 'status-provisional';
      case 'confirmed':
        return 'status-confirmed';
      case 'cancelled':
        return 'status-cancelled';
      case 'not-required':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={cn('status-badge', getStatusClass(status), className)}
      {...props}
    >
      {status}
    </span>
  );
}
