"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Check, ImagePlus, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

type DraftStatus = "idle" | "uploading" | "uploaded" | "error";

interface Draft {
  key: string;
  file: File;
  preview: string;
  name: string;
  gender: HairstyleGender;
  prompt: string;
  status: DraftStatus;
  /** Kept after a successful upload, so a retry doesn't upload the image again. */
  url?: string;
  error?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILES = 50;
const PARALLEL_UPLOADS = 3;

const PROMPT_EXAMPLE: Record<HairstyleGender, string> = {
  female: "e.g. Give her a shoulder-length layered shag with curtain bangs.",
  male: "e.g. Give him a textured crop with a mid skin fade.",
};

/** "wolf_cut-2.png" → "Wolf Cut 2" */
function nameFromFile(file: File) {
  return file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function GenderToggle({
  value,
  onChange,
  disabled,
}: {
  /** null: mixed (the "Set all to" toggle when drafts differ). */
  value: HairstyleGender | null;
  onChange: (g: HairstyleGender) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex rounded-md border p-0.5" role="group" aria-label="Gender">
      {(["female", "male"] as const).map((g) => (
        <button
          key={g}
          type="button"
          aria-pressed={value === g}
          disabled={disabled}
          onClick={() => onChange(g)}
          className={cn(
            "rounded px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50",
            value === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {g === "female" ? "Female" : "Male"}
        </button>
      ))}
    </div>
  );
}

/** Click or drop images. `compact` is the "add more" strip above the list. */
function DropZone({ onFiles, compact, disabled }: { onFiles: (files: File[]) => void; compact?: boolean; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !disabled && input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) onFiles(Array.from(e.dataTransfer.files));
      }}
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors",
        compact ? "gap-2 px-4 py-3 text-sm" : "flex-col gap-3 px-6 py-12",
        dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/40",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input
        ref={input}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {compact ? (
        <>
          <ImagePlus className="h-4 w-4 text-muted-foreground" />
          <span>
            <span className="font-medium text-primary">Add more photos</span> or drop them here
          </span>
        </>
      ) : (
        <>
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              <span className="text-primary">Choose photos</span> or drag and drop them here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              JPG or PNG, up to {MAX_FILES} at once. One photo per hairstyle; it&apos;s the tile customers see on the mirror.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function CustomHairstylesManager({ api, upload }: { api: CustomHairstylesApi; upload: UploadImage }) {
  const [hairstyles, setHairstyles] = useState<CustomHairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<"all" | HairstyleGender>("all");
  const [adding, setAdding] = useState<{ files: File[] } | null>(null);
  const [editing, setEditing] = useState<CustomHairstyle | null>(null);

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

  const count = (g: HairstyleGender) => hairstyles.filter((h) => h.gender === g).length;
  const shown = genderFilter === "all" ? hairstyles : hairstyles.filter((h) => h.gender === genderFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "female", "male"] as const).map((g) => (
            <Button key={g} size="sm" variant={genderFilter === g ? "default" : "outline"} onClick={() => setGenderFilter(g)}>
              {g === "all" ? "All" : g === "female" ? "Female" : "Male"}
              {!loading && (
                <span className="ml-1.5 tabular-nums opacity-70">{g === "all" ? hairstyles.length : count(g)}</span>
              )}
            </Button>
          ))}
        </div>
        <Button onClick={() => setAdding({ files: [] })} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add hairstyles
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      ) : hairstyles.length === 0 ? (
        <DropZone onFiles={(files) => setAdding({ files })} />
      ) : shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No {genderFilter} hairstyles yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((h) => (
            <li key={h.id} className="flex flex-col overflow-hidden rounded-lg border">
              <div className="relative aspect-[3/4] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.image} alt={h.name} className={cn("h-full w-full object-cover object-top", !h.is_active && "opacity-40")} />
                <Badge variant="secondary" className="absolute left-2 top-2 capitalize">
                  {h.gender}
                </Badge>
                {!h.is_active && (
                  <Badge variant="outline" className="absolute right-2 top-2 bg-background">
                    Hidden
                  </Badge>
                )}
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

      <AddHairstylesDialog
        open={!!adding}
        initialFiles={adding?.files ?? []}
        defaultGender={genderFilter === "male" ? "male" : "female"}
        onClose={() => setAdding(null)}
        upload={upload}
        create={api.create}
        onCreated={(created) => setHairstyles((prev) => [...created, ...prev])}
      />

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

function AddHairstylesDialog({
  open,
  initialFiles,
  defaultGender,
  onClose,
  upload,
  create,
  onCreated,
}: {
  open: boolean;
  /** Photos dropped on the page's empty state, added when the dialog opens. */
  initialFiles: File[];
  defaultGender: HairstyleGender;
  onClose: () => void;
  upload: UploadImage;
  create: CustomHairstylesApi["create"];
  onCreated: (created: CustomHairstyle[]) => void;
}) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  /** Missing fields are only flagged after the first save attempt. */
  const [showErrors, setShowErrors] = useState(false);

  // Object URLs are released when a draft is removed and when the dialog unmounts.
  const draftsRef = useRef(drafts);
  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);
  useEffect(() => () => draftsRef.current.forEach((d) => URL.revokeObjectURL(d.preview)), []);

  const addFiles = (files: File[]) => {
    const images = files.filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (images.length < files.length) toast.error("Only JPG and PNG photos can be added");
    setDrafts((prev) => {
      const room = MAX_FILES - prev.length;
      if (images.length > room) toast.error(`You can add up to ${MAX_FILES} hairstyles at once`);
      return [
        ...prev,
        ...images.slice(0, room).map((file) => ({
          key: `${file.name}-${file.size}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          name: nameFromFile(file),
          gender: defaultGender,
          prompt: "",
          status: "idle" as const,
        })),
      ];
    });
  };

  useEffect(() => {
    if (open && initialFiles.length) addFiles(initialFiles);
    // only when the dialog opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const reset = () => {
    drafts.forEach((d) => URL.revokeObjectURL(d.preview));
    setDrafts([]);
    setShowErrors(false);
    setPhase(null);
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const updateDraft = (key: string, patch: Partial<Draft>) =>
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));

  const removeDraft = (key: string) =>
    setDrafts((prev) => {
      const draft = prev.find((d) => d.key === key);
      if (draft) URL.revokeObjectURL(draft.preview);
      return prev.filter((d) => d.key !== key);
    });

  const setAllGenders = (gender: HairstyleGender) => setDrafts((prev) => prev.map((d) => ({ ...d, gender })));

  const invalid = (d: Draft) => !d.name.trim() || !d.prompt.trim();
  const missing = drafts.filter(invalid).length;
  const uploadedCount = drafts.filter((d) => d.status === "uploaded").length;

  const save = async () => {
    setShowErrors(true);
    if (!drafts.length || missing) return;
    setSaving(true);
    try {
      // Upload in small parallel batches; images uploaded on an earlier attempt are reused.
      setPhase("Uploading photos…");
      const urls = new Map(drafts.filter((d) => d.url).map((d) => [d.key, d.url!]));
      const queue = drafts.filter((d) => !d.url);
      let failed = 0;
      const worker = async () => {
        for (let d = queue.shift(); d; d = queue.shift()) {
          const { key, file } = d;
          updateDraft(key, { status: "uploading", error: undefined });
          try {
            const url = await upload(file);
            urls.set(key, url);
            updateDraft(key, { status: "uploaded", url });
          } catch (e) {
            failed++;
            updateDraft(key, { status: "error", error: e instanceof Error ? e.message : "Upload failed" });
          }
        }
      };
      await Promise.all(Array.from({ length: PARALLEL_UPLOADS }, worker));
      if (failed) {
        toast.error(`${failed} photo${failed === 1 ? "" : "s"} failed to upload. Remove ${failed === 1 ? "it" : "them"} or try again.`);
        return;
      }

      setPhase("Saving hairstyles…");
      const created = await create(
        drafts.map((d) => ({ name: d.name.trim(), prompt: d.prompt.trim(), gender: d.gender, image: urls.get(d.key)! })),
      );
      onCreated(created);
      toast.success(`${created.length} hairstyle${created.length === 1 ? "" : "s"} added`);
      reset();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save hairstyles");
    } finally {
      setSaving(false);
      setPhase(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent
        className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-3xl"
        onInteractOutside={(e) => saving && e.preventDefault()}
        onEscapeKeyDown={(e) => saving && e.preventDefault()}
      >
        <DialogHeader className="border-b p-6 pb-4">
          <DialogTitle>Add hairstyles</DialogTitle>
          <DialogDescription>
            Add a photo, a name and a prompt for each hairstyle. The photo is what customers see on the mirror; the prompt tells the AI how to style
            their hair.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          {drafts.length === 0 ? (
            <DropZone onFiles={addFiles} />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  {drafts.length} photo{drafts.length === 1 ? "" : "s"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Set all to
                  <GenderToggle
                    value={drafts.every((d) => d.gender === drafts[0].gender) ? drafts[0].gender : null}
                    onChange={setAllGenders}
                    disabled={saving}
                  />
                </div>
              </div>

              <ul className="space-y-3">
                {drafts.map((d, i) => {
                  const nameMissing = showErrors && !d.name.trim();
                  const promptMissing = showErrors && !d.prompt.trim();
                  return (
                    <li
                      key={d.key}
                      className={cn(
                        "relative flex gap-4 rounded-lg border p-3",
                        (nameMissing || promptMissing || d.status === "error") && "border-destructive/60",
                      )}
                    >
                      <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={d.preview} alt="" className="h-full w-full object-cover object-top" />
                        {d.status !== "idle" && (
                          <div
                            className={cn(
                              "absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 py-1 text-xs font-medium",
                              d.status === "error" ? "bg-destructive text-white" : "bg-background/90",
                            )}
                          >
                            {d.status === "uploading" && <Loader2 className="h-3 w-3 animate-spin" />}
                            {d.status === "uploaded" && <Check className="h-3 w-3 text-primary" />}
                            {d.status === "error" && <AlertCircle className="h-3 w-3" />}
                            {d.status === "uploading" ? "Uploading" : d.status === "uploaded" ? "Uploaded" : "Failed"}
                          </div>
                        )}
                      </div>

                      <div className="grid min-w-0 flex-1 gap-3 pr-8">
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="min-w-[180px] flex-1 space-y-1">
                            <Label htmlFor={`name-${d.key}`}>Name</Label>
                            <Input
                              id={`name-${d.key}`}
                              value={d.name}
                              onChange={(e) => updateDraft(d.key, { name: e.target.value })}
                              disabled={saving}
                              aria-invalid={nameMissing}
                              className={cn(nameMissing && "border-destructive")}
                            />
                          </div>
                          <GenderToggle value={d.gender} onChange={(gender) => updateDraft(d.key, { gender })} disabled={saving} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`prompt-${d.key}`}>Prompt</Label>
                          <Textarea
                            id={`prompt-${d.key}`}
                            rows={2}
                            placeholder={PROMPT_EXAMPLE[d.gender]}
                            value={d.prompt}
                            onChange={(e) => updateDraft(d.key, { prompt: e.target.value })}
                            disabled={saving}
                            aria-invalid={promptMissing}
                            className={cn("resize-none", promptMissing && "border-destructive")}
                          />
                        </div>
                        {(nameMissing || promptMissing || d.error) && (
                          <p className="text-xs text-destructive">
                            {d.error ?? `${[nameMissing && "Name", promptMissing && "Prompt"].filter(Boolean).join(" and ")} required`}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-7 w-7"
                        aria-label={`Remove photo ${i + 1}`}
                        onClick={() => removeDraft(d.key)}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>

              <DropZone onFiles={addFiles} compact disabled={saving || drafts.length >= MAX_FILES} />
            </>
          )}
        </div>

        <DialogFooter className="flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 text-sm text-muted-foreground">
            {saving ? (
              <div className="space-y-1.5">
                <p>{phase === "Uploading photos…" ? `Uploading photos… ${uploadedCount} of ${drafts.length}` : phase}</p>
                <Progress value={phase === "Uploading photos…" ? (uploadedCount / drafts.length) * 100 : 100} className="h-1.5" />
              </div>
            ) : showErrors && missing ? (
              <p className="text-destructive">
                {missing} hairstyle{missing === 1 ? " needs" : "s need"} a name and prompt
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={close} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving || drafts.length === 0}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {drafts.length ? `Add ${drafts.length} hairstyle${drafts.length === 1 ? "" : "s"}` : "Add hairstyles"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const [showErrors, setShowErrors] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(hairstyle && { name: hairstyle.name, image: hairstyle.image, prompt: hairstyle.prompt, gender: hairstyle.gender });
    setNewImage(null);
    setShowErrors(false);
  }, [hairstyle]);

  useEffect(() => () => {
    if (newImage) URL.revokeObjectURL(newImage.preview);
  }, [newImage]);

  const save = async () => {
    if (!hairstyle || !form) return;
    setShowErrors(true);
    if (!form.name.trim() || !form.prompt.trim()) return;
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

  const nameMissing = showErrors && !form?.name.trim();
  const promptMissing = showErrors && !form?.prompt.trim();

  return (
    <Dialog open={!!hairstyle} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit hairstyle</DialogTitle>
        </DialogHeader>
        {form && (
          <div className="flex flex-col gap-5 sm:flex-row">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={saving}
              className="group relative h-48 w-36 shrink-0 self-center overflow-hidden rounded-md bg-muted sm:self-start"
              aria-label="Change photo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={newImage?.preview ?? form.image} alt="" className="h-full w-full object-cover object-top" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-background/90 py-1.5 text-xs font-medium opacity-90 group-hover:opacity-100">
                <ImagePlus className="h-3.5 w-3.5" />
                Change photo
              </span>
              <input
                ref={fileInput}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && !ACCEPTED_TYPES.includes(file.type)) toast.error("Only JPG and PNG photos can be added");
                  else if (file) setNewImage({ file, preview: URL.createObjectURL(file) });
                  e.target.value = "";
                }}
              />
            </button>
            <div className="grid flex-1 content-start gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  aria-invalid={nameMissing}
                  className={cn(nameMissing && "border-destructive")}
                />
              </div>
              <div className="space-y-1">
                <Label>Gender</Label>
                <div>
                  <GenderToggle value={form.gender} onChange={(gender) => setForm({ ...form, gender })} disabled={saving} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-prompt">Prompt</Label>
                <Textarea
                  id="edit-prompt"
                  rows={4}
                  placeholder={PROMPT_EXAMPLE[form.gender]}
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  aria-invalid={promptMissing}
                  className={cn("resize-none", promptMissing && "border-destructive")}
                />
                {(nameMissing || promptMissing) && <p className="text-xs text-destructive">Name and prompt are required</p>}
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
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
