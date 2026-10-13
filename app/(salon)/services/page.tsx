"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteService, getServices, SalonService } from "@/lib/api/services/services_api";
import { useTranslation } from "@/lib/i18n/language-provider";
import { ServiceFormDialog } from "./service-form-dialog";

export default function ServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SalonService | null>(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      setServices(await getServices());
    } catch {
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category_name.toLowerCase().includes(q) ||
        s.subcategory_name.toLowerCase().includes(q)
    );
  }, [services, search]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (service: SalonService) => {
    setEditing(service);
    setDialogOpen(true);
  };

  const handleDelete = async (service: SalonService) => {
    if (!window.confirm(t("services.deleteConfirm"))) return;
    try {
      await deleteService(service.id);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      toast.success("Service deleted");
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const formatPrice = (s: SalonService) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: s.currency,
      maximumFractionDigits: 0,
    }).format(s.price);

  return (
    <div className="w-full min-w-0 space-y-6">
      <Card className="min-w-0 gap-0 overflow-hidden border-0 py-0 shadow-lg">
        <CardHeader className="space-y-0 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-xl font-bold sm:text-2xl">{t("services.title")}</CardTitle>
              <CardDescription className="mt-2">{t("services.subtitle")}</CardDescription>
            </div>
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t("services.add")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="min-w-0 space-y-4 p-3 sm:p-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("services.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
              {error}
              <Button variant="outline" size="sm" className="ml-3" onClick={loadServices}>
                {t("common.refresh")}
              </Button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {services.length === 0 ? t("services.empty") : t("services.noMatch")}
            </p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {filtered.map((s) => (
                <li key={s.id} className="flex gap-3 rounded-lg border p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image} alt={s.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-snug break-words">{s.name}</p>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={t("common.edit")}
                          onClick={() => openEdit(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label={t("common.delete")}
                          onClick={() => handleDelete(s)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {[s.category_name, s.subcategory_name].filter(Boolean).join(" · ")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
                      <Badge variant={s.is_active ? "default" : "secondary"}>
                        {s.is_active ? t("common.active") : t("common.inactive")}
                      </Badge>
                      <Badge variant="outline">{t(`services.${s.service_type}`)}</Badge>
                      <span className="font-semibold tabular-nums">{formatPrice(s)}</span>
                      {s.duration && (
                        <span className="text-xs text-muted-foreground">{s.duration}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ServiceFormDialog
        service={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={loadServices}
      />
    </div>
  );
}
