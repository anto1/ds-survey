import { CheckCircle } from "lucide-react";

export function ThankYou() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <CheckCircle className="h-16 w-16 text-primary mb-6" />
      <h2 className="text-3xl font-light tracking-tight mb-4">
        Thank you
      </h2>
      <p className="text-muted-foreground max-w-md">
        Your response has been recorded. We appreciate you taking the time to
        share which design channels you follow.
      </p>
    </div>
  );
}
