"use client";

import { useState, useEffect } from "react";
import { LoginForm } from "./login-form";

type Props = {
  children: React.ReactNode;
};

export function AdminWrapper({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    setIsAuthenticated(auth === "true");
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}
