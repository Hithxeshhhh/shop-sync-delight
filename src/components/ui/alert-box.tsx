import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { ReactNode } from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertBoxProps {
  variant: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  success: {
    container: "bg-green-50 border-green-200 text-green-800",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: <XCircle className="h-5 w-5 text-red-500" />,
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
};

export function AlertBox({ 
  variant = "info", 
  title, 
  children, 
  className = "" 
}: AlertBoxProps) {
  const styles = variantStyles[variant];
  
  return (
    <div className={`border rounded-md p-4 ${styles.container} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        <div>
          {title && <h3 className="font-medium mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
} 