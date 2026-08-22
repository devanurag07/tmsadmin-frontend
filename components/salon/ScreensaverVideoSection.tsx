"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trash2, Video } from "lucide-react";
import {
  uploadSalonVideo,
  type UploadProgressInfo,
} from "@/lib/api/products/upload_image";
import { updateSalonScreensaverVideo } from "@/lib/api/salon/salon_api";

interface ScreensaverVideoSectionProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

function formatMb(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 10) return mb.toFixed(1);
  return mb.toFixed(0);
}

/**
 * Upload / preview / remove the salon's mirror kiosk screensaver video.
 * Matches the superadmin SalonFormDialog VideoUploadSection flow: upload to
 * UploadThing via the salon video endpoint, then persist the URL on the salon.
 */
export function ScreensaverVideoSection({
  value,
  onChange,
  disabled,
}: ScreensaverVideoSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<UploadProgressInfo>({
    percent: 0,
    loaded: 0,
    total: 0,
    phase: "uploading",
  });
  const [error, setError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const previewUrl = localPreviewUrl || value || null;
  const busy = disabled || uploading || saving;

  const persistUrl = async (url: string) => {
    setSaving(true);
    setError(null);
    try {
      const response = await updateSalonScreensaverVideo(url);
      if (!response.success) {
        setError(response.message || "Failed to save screensaver video");
        return false;
      }
      onChange(url);
      return true;
    } catch {
      setError("Failed to save screensaver video");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleVideoSelect = async (file: File | null) => {
    if (!file) return;

    setError(null);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setProgress({ percent: 0, loaded: 0, total: file.size, phase: "uploading" });

    const result = await uploadSalonVideo(file, setProgress);
    setUploading(false);

    if (!result.success || !result.data) {
      setError(result.message);
      return;
    }

    const saved = await persistUrl(result.data);
    if (saved) {
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  };

  const handleRemoveVideo = async () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setProgress({ percent: 0, loaded: 0, total: 0, phase: "uploading" });
    await persistUrl("");
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <Video className="h-4 w-4" />
            Screensaver video
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Optional looping video for the mirror kiosk. Idle timeout is set on
            each device under Camera Settings.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading || saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Video className="h-4 w-4" />
            )}
            {uploading
              ? progress.phase === "processing"
                ? "Processing..."
                : "Uploading..."
              : saving
                ? "Saving..."
                : value
                  ? "Replace video"
                  : "Upload video"}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => void handleRemoveVideo()}
            >
              <Trash2 className="h-4 w-4" />
              Remove video
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          void handleVideoSelect(file);
          e.target.value = "";
        }}
      />

      <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
        {previewUrl ? (
          <video
            src={previewUrl}
            className="h-full w-full object-contain"
            controls
            muted
            playsInline
          />
        ) : (
          <span className="px-2 text-center text-xs text-muted-foreground">
            No screensaver video set
          </span>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs tabular-nums text-muted-foreground">
            <span>
              {formatMb(progress.loaded)} MB / {formatMb(progress.total)} MB
            </span>
            <span className="font-medium text-foreground">
              {progress.percent}%
            </span>
          </div>
          <Progress
            value={progress.percent}
            className={`h-2.5 ${progress.phase === "processing" ? "animate-pulse" : ""}`}
          />
          <p className="text-xs text-muted-foreground">
            {progress.phase === "processing"
              ? "Upload received — finishing on the server (large videos can take a few minutes)."
              : "Sending video to the server…"}
          </p>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {value && !uploading && !saving && (
        <p className="break-all text-xs text-muted-foreground">{value}</p>
      )}
    </div>
  );
}
