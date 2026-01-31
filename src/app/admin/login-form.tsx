"use client";

import { useState, useTransition } from "react";
import { verifyAdminPassword } from "@/actions/admin";

type Props = {
  onSuccess: () => void;
};

export function LoginForm({ onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const valid = await verifyAdminPassword(password);
      if (valid) {
        // Store in sessionStorage
        sessionStorage.setItem("admin_auth", "true");
        onSuccess();
      } else {
        setError("Неверный пароль");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-normal text-center">Админ</h1>

        <div className="space-y-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full px-4 py-3 border border-border bg-background text-foreground focus:outline-none focus:border-foreground"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending || !password}
          className="w-full px-4 py-3 bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
