"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Pencil, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Custom hairstyles (image + try-on prompt) shown on the mirror next to the default
 * haircut catalogue. Kept identical in tmsadmin-frontend and tms-superadmin-frontend;
 * each page passes its own API and image upload.
 */
export type HairstyleGender = "female" | "male";

export interface CustomHairstyle {
  id: number;
  salon_id: number | null;
  name: string;
  image: string;
  prompt: string;
  gender: HairstyleGender;
  order: number;
  is_active: boolean;
}

export interface NewCustomHairstyle {
  name: string;
  image: string;
  prompt: string;
  gender: HairstyleGender;
}

export interface CustomHairstylesApi {
  list: () => Promise<CustomHairstyle[]>;
  create: (hairstyles: NewCustomHairstyle[]) => Promise<CustomHairstyle[]>;
  update: (id: number, data: Partial<NewCustomHairstyle> & { is_active?: boolean }) => Promise<CustomHairstyle>;
  remove: (id: number) => Promise<void>;
}

/** Returns the uploaded image URL. */
export type UploadImage = (file: File) => Promise<string>;

interface Draft {
  key: string;
  file: File;
  preview: string;
  name: string;
  gender: HairstyleGender;
  prompt: string;
}

const ACCEPT = "image/jpeg,image/png,image/jpg";
const MAX_FILES = 50;

/** "wolf_cut-2.png" → "Wolf Cut 2" */
function nameFromFile(file: File) {
  return file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function GenderSelect({ value, onChange }: { value: HairstyleGender; onChange: (g: HairstyleGender) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as HairstyleGender)}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="female">Female</SelectItem>
        <SelectItem value="male">Male</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function CustomHairstylesManager({ api, upload }: { api: CustomHairstylesApi; upload: UploadImage }) {
  const [hairstyles, setHairstyles] = useState<CustomHairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<"all" | HairstyleGender>("all");
  const [editing, setEditing] = useState<CustomHairstyle | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      setHairstyles(await api.list());
    } catch {
      toast.error("Failed to load hairstyles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // api changes when the superadmin switches salon
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  // Drafts' object URLs are released when they're removed or saved.
  const draftsRef = useRef(drafts);
  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);
  useEffect(() => () => draftsRef.current.forEach((d) => URL.revokeObjectURL(d.preview)), []);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const images = Array.from(files).filter((f) => ACCEPT.split(",").includes(f.type));
    if (images.length < files.length) toast.error("Only JPG and PNG images are allowed");
    const room = MAX_FILES - drafts.length;
    if (images.length > room) toast.error(`You can upload up to ${MAX_FILES} hairstyles at once`);
    const gender: HairstyleGender = genderFilter === "male" ? "male" : "female";
    setDrafts((prev) => [
      ...prev,
      ...images.slice(0, room).map((file) => ({
        key: `${file.name}-${file.size}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        name: nameFromFile(file),
        gender,
        prompt: "",
      })),
    ]);
    if (fileInput.current) fileInput.current.value = "";
  };

  const updateDraft = (key: string, patch: Partial<Draft>) =>
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));

  const removeDraft = (key: string) =>
    setDrafts((prev) => {
      const draft = prev.find((d) => d.key === key);
      if (draft) URL.revokeObjectURL(draft.preview);
      return prev.filter((d) => d.key !== key);
    });

  const saveDrafts = async () => {
    const incomplete = drafts.findIndex((d) => !d.name.trim() || !d.prompt.trim());
    if (incomplete >= 0) {
      toast.error(`Hairstyle ${incomplete + 1}: name and prompt are required`);
      return;
    }
    try {
      const rows: NewCustomHairstyle[] = [];
      for (const [i, d] of drafts.entries()) {
        setSaving(`Uploading image ${i + 1} of ${drafts.length}…`);
        rows.push({ name: d.name.trim(), prompt: d.prompt.trim(), gender: d.gender, image: await upload(d.file) });
      }
      setSaving("Saving hairstyles…");
      const created = await api.create(rows);
      drafts.forEach((d) => URL.revokeObjectURL(d.preview));
      setDrafts([]);
      setHairstyles((prev) => [...created, ...prev]);
      toast.success(`${created.length} hairstyle${created.length === 1 ? "" : "s"} added`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save hairstyles");
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (h: CustomHairstyle) => {
    try {
      const updated = await api.update(h.id, { is_active: !h.is_active });
      setHairstyles((prev) => prev.map((x) => (x.id === h.id ? { ...x, ...updated } : x)));
    } catch {
      toast.error("Failed to update hairstyle");
    }
  };

  const remove = async (h: CustomHairstyle) => {
    if (!window.confirm(`Delete "${h.name}"? It will no longer show on the mirror.`)) return;
    try {
      await api.remove(h.id);
      setHairstyles((prev) => prev.filter((x) => x.id !== h.id));
      toast.success("Hairstyle deleted");
    } catch {
      toast.error("Failed to delete hairstyle");
    }
  };

  const shown = genderFilter === "all" ? hairstyles : hairstyles.filter((h) => h.gender === genderFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "female", "male"] as const).map((g) => (
            <Button key={g} size="sm" variant={genderFilter === g ? "default" : "outline"} onClick={() => setGenderFilter(g)}>
              {g === "all" ? "All" : g === "female" ? "Female" : "Male"}
            </Button>
          ))}
        </div>
        <input ref={fileInput} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <Button onClick={() => fileInput.current?.click()} disabled={!!saving} className="w-full sm:w-auto">
          <Upload className="mr-2 h-4 w-4" />
          Upload hairstyles
        </Button>
      </div>

      {drafts.length > 0 && (
        <div className="space-y-4 rounded-lg border border-dashed p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">
              New hairstyles ({drafts.length})
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                The image is shown on the mirror; the prompt tells the AI how to style the hair.
              </span>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={!!saving}>
                <ImagePlus className="mr-2 h-4 w-4" />
                Add more
              </Button>
              <Button size="sm" onClick={saveDrafts} disabled={!!saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ?? `Save ${drafts.length} hairstyle${drafts.length === 1 ? "" : "s"}`}
              </Button>
            </div>
          </div>
          <ul className="space-y-3">
            {drafts.map((d) => (
              <li key={d.key} className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.preview} alt="" className="h-32 w-32 shrink-0 rounded-md object-cover object-top" />
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[1fr_140px]">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input value={d.name} onChange={(e) => updateDraft(d.key, { name: e.target.value })} disabled={!!saving} />
                  </div>
                  <div className="space-y-1">
                    <Label>Gender</Label>
                    <GenderSelect value={d.gender} onChange={(gender) => updateDraft(d.key, { gender })} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Prompt</Label>
                    <Textarea
                      rows={2}
                      placeholder={
                        d.gender === "male"
                          ? "e.g. Give him a textured crop with a mid skin fade."
                          : "e.g. Give her a shoulder-length layered shag with curtain bangs."
                      }
                      value={d.prompt}
                      onChange={(e) => updateDraft(d.key, { prompt: e.target.value })}
                      disabled={!!saving}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 self-end sm:self-start"
                  aria-label="Remove"
                  onClick={() => removeDraft(d.key)}
                  disabled={!!saving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No custom hairstyles yet. Upload images to add them to the mirror&apos;s hairstyle catalogue, next to the default ones.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((h) => (
            <li key={h.id} className="flex flex-col overflow-hidden rounded-lg border">
              <div className="relative aspect-[3/4] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.image} alt={h.name} className={`h-full w-full object-cover object-top ${h.is_active ? "" : "opacity-40"}`} />
                <Badge variant="secondary" className="absolute left-2 top-2 capitalize">
                  {h.gender}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <p className="font-semibold leading-snug break-words">{h.name}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground" title={h.prompt}>
                  {h.prompt}
                </p>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs">
                    <Switch checked={h.is_active} onCheckedChange={() => toggleActive(h)} />
                    {h.is_active ? "Shown" : "Hidden"}
                  </label>
                  <div className="flex">
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit" onClick={() => setEditing(h)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      aria-label="Delete"
                      onClick={() => remove(h)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <EditHairstyleDialog
        hairstyle={editing}
        onClose={() => setEditing(null)}
        upload={upload}
        onSave={async (id, data) => {
          const updated = await api.update(id, data);
          setHairstyles((prev) => prev.map((x) => (x.id === id ? { ...x, ...updated } : x)));
        }}
      />
    </div>
  );
}

function EditHairstyleDialog({
  hairstyle,
  onClose,
  onSave,
  upload,
}: {
  hairstyle: CustomHairstyle | null;
  onClose: () => void;
  onSave: (id: number, data: Partial<NewCustomHairstyle>) => Promise<void>;
  upload: UploadImage;
}) {
  const [form, setForm] = useState<NewCustomHairstyle | null>(null);
  const [newImage, setNewImage] = useState<{ file: File; preview: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(hairstyle && { name: hairstyle.name, image: hairstyle.image, prompt: hairstyle.prompt, gender: hairstyle.gender });
    setNewImage(null);
  }, [hairstyle]);

  useEffect(() => () => {
    if (newImage) URL.revokeObjectURL(newImage.preview);
  }, [newImage]);

  const save = async () => {
    if (!hairstyle || !form) return;
    if (!form.name.trim() || !form.prompt.trim()) {
      toast.error("Name and prompt are required");
      return;
    }
    setSaving(true);
    try {
      const image = newImage ? await upload(newImage.file) : form.image;
      await onSave(hairstyle.id, { ...form, name: form.name.trim(), prompt: form.prompt.trim(), image });
      toast.success("Hairstyle updated");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update hairstyle");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!hairstyle} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit hairstyle</DialogTitle>
        </DialogHeader>
        {form && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex shrink-0 flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={newImage?.preview ?? form.image} alt="" className="h-40 w-32 rounded-md object-cover object-top" />
              <input
                ref={fileInput}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setNewImage({ file, preview: URL.createObjectURL(file) });
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={saving}>
                Change image
              </Button>
            </div>
            <div className="grid flex-1 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Gender</Label>
                <GenderSelect value={form.gender} onChange={(gender) => setForm({ ...form, gender })} />
              </div>
              <div className="space-y-1">
                <Label>Prompt</Label>
                <Textarea rows={4} value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
