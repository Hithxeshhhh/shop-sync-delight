import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
} 