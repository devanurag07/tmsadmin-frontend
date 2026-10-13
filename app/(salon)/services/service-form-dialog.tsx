"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  createService,
  createServiceCategory,
  createServiceSubCategory,
  getServiceCategories,
  SalonService,
  ServiceCategory,
  ServiceInput,
  updateService,
} from "@/lib/api/services/services_api";
import { upload_product_image } from "@/lib/api/products/upload_image";
import { useTranslation } from "@/lib/i18n/language-provider";

const CREATE = "__create__";

const serviceFormSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  gender: z.enum(["male", "female", "unisex"]),
  service_type: z.enum(["hair", "skin"]),
  duration: z.string().min(1, "Duration is required"),
  price: z.coerce.number().min(0, "Price is required"),
  currency: z.enum(["INR", "USD", "EUR", "KWD"]),
  category: z.string().min(1, "Category is required"),
  sub_category: z.string().optional(),
  image: z.string().optional(),
  is_active: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

function defaultValues(service?: SalonService | null): ServiceFormValues {
  return {
    name: service?.name ?? "",
    description: service?.description ?? "",
    gender: service?.gender ?? "unisex",
    service_type: service?.service_type ?? "hair",
    duration: service?.duration ?? "",
    price: service?.price ?? 0,
    currency: service?.currency ?? "INR",
    category: service?.category ? String(service.category) : "",
    sub_category: service?.sub_category ? String(service.sub_category) : "",
    image: service?.image ?? "",
    is_active: service?.is_active ?? true,
  };
}

interface ServiceFormDialogProps {
  service?: SalonService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ServiceFormDialog({
  service,
  open,
  onOpenChange,
  onSaved,
}: ServiceFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(service);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: defaultValues(service),
  });

  const categoryId = form.watch("category");
  const image = form.watch("image");
  const selectedCategory = categories.find((c) => String(c.id) === categoryId);

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues(service));
    getServiceCategories()
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));
  }, [open, service, form]);

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setImageUploadProgress(0);
    const result = await upload_product_image(file, 0, setImageUploadProgress);
    setImageUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!result.success || !result.data) {
      toast.error(result.message || "Image upload failed");
      return;
    }
    form.setValue("image", encodeURI(result.data));
  };

  const addCategory = async () => {
    const name = window.prompt(t("services.newCategory"))?.trim();
    if (!name) return;
    try {
      const created = await createServiceCategory(name);
      setCategories((prev) =>
        prev.some((c) => c.id === created.id) ? prev : [...prev, created]
      );
      form.setValue("category", String(created.id));
      form.setValue("sub_category", "");
    } catch {
      toast.error("Failed to create category");
    }
  };

  const addSubCategory = async (category: ServiceCategory) => {
    const name = window.prompt(t("services.newSubCategory"))?.trim();
    if (!name) return;
    try {
      const created = await createServiceSubCategory(name, category.id);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id && !c.sub_categories.some((s) => s.id === created.id)
            ? { ...c, sub_categories: [...c.sub_categories, created] }
            : c
        )
      );
      form.setValue("sub_category", String(created.id));
    } catch {
      toast.error("Failed to create sub-category");
    }
  };

  const onSubmit = async (data: ServiceFormValues) => {
    const payload: ServiceInput = {
      name: data.name,
      description: data.description,
      gender: data.gender,
      service_type: data.service_type,
      duration: data.duration,
      price: data.price,
      currency: data.currency,
      category: Number.parseInt(data.category, 10),
      sub_category: data.sub_category ? Number.parseInt(data.sub_category, 10) : null,
      image: data.image || null,
      is_active: data.is_active,
    };

    setSaving(true);
    try {
      if (service) {
        await updateService(service.id, payload);
        toast.success("Service updated");
      } else {
        await createService(payload);
        toast.success("Service created");
      }
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Failed to save service. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("services.edit") : t("services.add")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("services.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Keratin Treatment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("services.description")}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="service_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("services.type")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hair">{t("services.hair")}</SelectItem>
                        <SelectItem value="skin">{t("services.skin")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("services.gender")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">{t("services.male")}</SelectItem>
                        <SelectItem value="female">{t("services.female")}</SelectItem>
                        <SelectItem value="unisex">{t("services.unisex")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("services.category")}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        if (value === CREATE) {
                          void addCategory();
                          return;
                        }
                        field.onChange(value);
                        form.setValue("sub_category", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("services.category")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                        <SelectItem value={CREATE}>
                          <Plus className="h-3 w-3" /> {t("services.newCategory")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sub_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("services.subCategory")}</FormLabel>
                    <Select
                      value={field.value || ""}
                      disabled={!selectedCategory}
                      onValueChange={(value) => {
                        if (value === CREATE) {
                          if (selectedCategory) void addSubCategory(selectedCategory);
                          return;
                        }
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("services.optional")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedCategory?.sub_categories.map((sub) => (
                          <SelectItem key={sub.id} value={String(sub.id)}>
                            {sub.name}
                          </SelectItem>
                        ))}
                        <SelectItem value={CREATE}>
                          <Plus className="h-3 w-3" /> {t("services.newSubCategory")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("services.duration")}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 45 mins" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("services.price")}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("services.currency")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="KWD">KWD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">{t("services.image")}</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-[160px] flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    className="hidden"
                    onChange={(e) => void onImageChange(e)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={imageUploading || saving}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imageUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="mr-2 h-4 w-4" />
                    )}
                    {t("services.uploadImage")}
                  </Button>
                  {imageUploading && <Progress value={imageUploadProgress} className="h-2" />}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>{t("common.active")}</FormLabel>
                    <p className="text-sm text-muted-foreground">{t("services.activeDesc")}</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={saving || imageUploading}>
                {saving
                  ? t("common.saving")
                  : isEdit
                    ? t("common.saveChanges")
                    : t("services.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
