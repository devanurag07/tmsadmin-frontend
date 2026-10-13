"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { login } from "@/lib/api/login/login_api";
import { useTranslation } from "@/lib/i18n/language-provider";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const response = await login(email, password);
    setSubmitting(false);
    if (response.success) {
      if (response.data) {
        localStorage.setItem("access-tmsadmin", response.data.access);
        localStorage.setItem("refresh-tmsadmin", response.data.refresh);
        window.location.href = "/";
      }
    } else {
      setError(response.message);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t("login.title")}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t("login.subtitle")}
        </p>
      </div>
      <div className="grid gap-6">
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid gap-3">
          <Label htmlFor="email">{t("login.id")}</Label>
          <Input
            id="email"
            placeholder="AURE01"
            autoComplete="username"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">{t("login.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t("login.submitting") : t("login.submit")}
        </Button>
      </div>
    </form>
  );
}
