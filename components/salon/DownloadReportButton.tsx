"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { generateSkinReportToken } from "@/lib/api/skin/skin_results_api";
import { generateHairReportToken } from "@/lib/api/mirror/mirror_api";
import {
  hairReportPdfUrl,
  skinReportPdfUrl,
  triggerDownload,
} from "@/lib/salon/reportLinks";

interface DownloadReportButtonProps {
  kind: "skin" | "hair";
  resultId: number;
  variant?: "outline" | "default" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  label?: string;
}

/**
 * Downloads the exact same customer-facing PDF report used by the
 * FLUX_VERSION_3 kiosk app for this result: mints a fresh report token
 * (server-side, scoped to this salon), then triggers a download from the
 * FLUX app's own report/PDF route — the identical Puppeteer-rendered report.
 */
export function DownloadReportButton({
  kind,
  resultId,
  variant = "outline",
  size = "sm",
  className,
  label = "Download Report",
}: DownloadReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        kind === "skin"
          ? await generateSkinReportToken(resultId)
          : await generateHairReportToken(resultId);

      if (!res.success || !res.data) {
        setError(res.message || "Failed to generate report");
        return;
      }

      const { id, token } = res.data;
      const url =
        kind === "skin" ? skinReportPdfUrl(id, token) : hairReportPdfUrl(id, token);
      triggerDownload(url, kind === "skin" ? "skin-report.pdf" : "hair-report.pdf");

      // Puppeteer PDF generation on FLUX commonly takes 15–40s; keep the
      // loading state so users don't double-click while it renders.
      setTimeout(() => setLoading(false), 35000);
    } catch (e) {
      console.error("Failed to download report:", e);
      setError("Failed to download report");
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={loading}
        onClick={handleDownload}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="mr-2 h-4 w-4" />
        )}
        {loading ? "Generating…" : label}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
