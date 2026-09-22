"use client";

import { useState, useRef } from "react";
import { Loader2, Palette, Type, ImageIcon, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateHomepageCustomization } from "@/lib/api/salon/salon_api";
import { upload_logo_image } from "@/lib/api/products/upload_image";
import Image from "next/image";

interface HomepageCustomizationSectionProps {
  welcomeText: string;
  doodleImage: string;
  primaryColor: string;
  bgColor: string;
  accentColor: string;
  onChange: (fields: {
    homepage_welcome_text?: string;
    homepage_doodle_image?: string;
    theme_primary_color?: string;
    theme_bg_color?: string;
    theme_accent_color?: string;
  }) => void;
  disabled?: boolean;
}

export function HomepageCustomizationSection({
  welcomeText,
  doodleImage,
  primaryColor,
  bgColor,
  accentColor,
  onChange,
  disabled,
}: HomepageCustomizationSectionProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const doodleInputRef = useRef<HTMLInputElement>(null);

  const [localWelcomeText, setLocalWelcomeText] = useState(welcomeText);
  const [localPrimaryColor, setLocalPrimaryColor] = useState(primaryColor || "#ffffff");
  const [localBgColor, setLocalBgColor] = useState(bgColor || "#000000");
  const [localAccentColor, setLocalAccentColor] = useState(accentColor || "#ffffff");

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await updateHomepageCustomization({
        homepage_welcome_text: localWelcomeText,
        theme_primary_color: localPrimaryColor,
        theme_bg_color: localBgColor,
        theme_accent_color: localAccentColor,
      });
      if (!response.success) {
        setError(response.message || "Failed to save customization");
        return;
      }
      onChange({
        homepage_welcome_text: localWelcomeText,
        theme_primary_color: localPrimaryColor,
        theme_bg_color: localBgColor,
        theme_accent_color: localAccentColor,
      });
      setSuccess("Homepage customization saved!");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to save customization");
    } finally {
      setSaving(false);
    }
  };

  const handleDoodleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const uploadResult = await upload_logo_image(file);
      if (!uploadResult.success || !uploadResult.data) {
        setError(uploadResult.message || "Failed to upload doodle image");
        return;
      }
      const imageUrl = encodeURI(uploadResult.data);
      const response = await updateHomepageCustomization({
        homepage_doodle_image: imageUrl,
      });
      if (!response.success) {
        setError(response.message || "Failed to save doodle image");
        return;
      }
      onChange({ homepage_doodle_image: imageUrl });
      setSuccess("Doodle image updated!");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to upload doodle image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDoodle = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await updateHomepageCustomization({
        homepage_doodle_image: "",
      });
      if (!response.success) {
        setError(response.message || "Failed to remove doodle image");
        return;
      }
      onChange({ homepage_doodle_image: "" });
      setSuccess("Doodle image removed!");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to remove doodle image");
    } finally {
      setSaving(false);
    }
  };

  const handleResetColors = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await updateHomepageCustomization({
        theme_primary_color: "",
        theme_bg_color: "",
        theme_accent_color: "",
        homepage_welcome_text: "",
      });
      if (!response.success) {
        setError(response.message || "Failed to reset");
        return;
      }
      setLocalWelcomeText("");
      setLocalPrimaryColor("#ffffff");
      setLocalBgColor("#000000");
      setLocalAccentColor("#ffffff");
      onChange({
        homepage_welcome_text: "",
        theme_primary_color: "",
        theme_bg_color: "",
        theme_accent_color: "",
      });
      setSuccess("Reset to defaults!");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to reset");
    } finally {
      setSaving(false);
    }
  };

  const busy = disabled || saving || uploading;

  return (
    <div className="space-y-6 rounded-xl border bg-card p-4 sm:p-6">
      <div>
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Palette className="h-5 w-5" />
          Homepage Customization
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize your mirror kiosk homepage for celebrations, festivals, or
          seasonal themes. Change the welcome text, doodle art, and color scheme.
        </p>
      </div>

      {/* Welcome Text */}
      <div className="space-y-2">
        <Label
          htmlFor="welcome-text"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Type className="h-4 w-4" />
          Welcome Text
        </Label>
        <p className="text-xs text-muted-foreground">
          Custom welcome message on the landing page. Leave empty for the
          default &quot;Welcome to the future!&quot;
        </p>
        <Input
          id="welcome-text"
          placeholder="e.g. Happy Diwali! Welcome to TryMyStyle"
          value={localWelcomeText}
          onChange={(e) => setLocalWelcomeText(e.target.value)}
          disabled={busy}
          maxLength={255}
        />
      </div>

      {/* Doodle Image */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="h-4 w-4" />
          Homepage Doodle / Art
        </Label>
        <p className="text-xs text-muted-foreground">
          Upload a custom doodle or illustration for the homepage hero section.
          Leave empty for the default art.
        </p>
        <div className="flex items-center gap-4">
          {doodleImage ? (
            <div className="relative w-[120px] h-[80px] rounded border bg-black overflow-hidden">
              <Image
                src={doodleImage}
                alt="Current doodle"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-[120px] h-[80px] rounded border bg-muted">
              <span className="text-xs text-muted-foreground">Default</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              type="file"
              ref={doodleInputRef}
              className="hidden"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDoodleUpload(file);
                e.target.value = "";
              }}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => doodleInputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Uploading...
                </>
              ) : (
                "Upload Doodle"
              )}
            </Button>
            {doodleImage && (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={handleRemoveDoodle}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Theme Colors */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Palette className="h-4 w-4" />
          Theme Colors
        </Label>
        <p className="text-xs text-muted-foreground">
          Set custom colors for celebrations (Diwali, Christmas, Halloween,
          etc.). Leave at defaults when not running a theme.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Background Color */}
          <div className="space-y-1.5">
            <Label htmlFor="bg-color" className="text-xs">
              Background
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="bg-color"
                value={localBgColor}
                onChange={(e) => setLocalBgColor(e.target.value)}
                disabled={busy}
                className="h-9 w-12 cursor-pointer rounded border p-0.5"
              />
              <Input
                value={localBgColor}
                onChange={(e) => setLocalBgColor(e.target.value)}
                disabled={busy}
                className="font-mono text-xs h-9"
                maxLength={7}
              />
            </div>
          </div>

          {/* Primary / Button Color */}
          <div className="space-y-1.5">
            <Label htmlFor="primary-color" className="text-xs">
              Button / CTA
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="primary-color"
                value={localPrimaryColor}
                onChange={(e) => setLocalPrimaryColor(e.target.value)}
                disabled={busy}
                className="h-9 w-12 cursor-pointer rounded border p-0.5"
              />
              <Input
                value={localPrimaryColor}
                onChange={(e) => setLocalPrimaryColor(e.target.value)}
                disabled={busy}
                className="font-mono text-xs h-9"
                maxLength={7}
              />
            </div>
          </div>

          {/* Accent / Text Color */}
          <div className="space-y-1.5">
            <Label htmlFor="accent-color" className="text-xs">
              Text / Accent
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="accent-color"
                value={localAccentColor}
                onChange={(e) => setLocalAccentColor(e.target.value)}
                disabled={busy}
                className="h-9 w-12 cursor-pointer rounded border p-0.5"
              />
              <Input
                value={localAccentColor}
                onChange={(e) => setLocalAccentColor(e.target.value)}
                disabled={busy}
                className="font-mono text-xs h-9"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div
          className="mt-3 rounded-lg border p-4 text-center transition-colors"
          style={{ backgroundColor: localBgColor }}
        >
          <p
            className="text-lg font-semibold italic"
            style={{ color: localAccentColor }}
          >
            {localWelcomeText || "Welcome to the future!"}
          </p>
          <div
            className="mt-2 inline-block rounded-lg px-4 py-1.5 text-sm font-medium"
            style={{
              backgroundColor: localPrimaryColor,
              color: localBgColor,
            }}
          >
            Begin your AI Consultation
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={busy}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button variant="outline" onClick={handleResetColors} disabled={busy}>
          Reset to Defaults
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
    </div>
  );
}
