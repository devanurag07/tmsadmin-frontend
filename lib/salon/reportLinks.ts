import api from "@/lib/api/axios_api";

/**
 * Links into the FLUX_VERSION_3 customer/kiosk app's report pipeline.
 *
 * The salon admin doesn't render PDF reports itself — it reuses the exact
 * same customer-facing report pages and Puppeteer-based PDF route already
 * deployed on the FLUX app, by minting a fresh report token (the original
 * token created at analysis time expires after 60 minutes) and then
 * navigating to that app's `/api/.../pdf` route, which returns the PDF with
 * a `Content-Disposition: attachment` header — the browser downloads it
 * without needing CORS, exactly like the customer kiosk flow does.
 *
 * IMPORTANT: the FLUX app must talk to the *same* Django API that minted
 * the token. Local admin (`localhost:8000`) → local FLUX (`:3002`).
 * Production admin → https://salon.trymystyle.com.
 */
function resolveFluxReportAppUrl(): string {
  if (process.env.NEXT_PUBLIC_FLUX_REPORT_APP_URL) {
    return process.env.NEXT_PUBLIC_FLUX_REPORT_APP_URL.replace(/\/$/, "");
  }
  const apiBase = api.defaults.baseURL ?? "";
  if (/localhost|127\.0\.0\.1/.test(apiBase)) {
    // Local FLUX_VERSION_3 (run: `npm run dev -- -p 3002` in that repo)
    return "http://localhost:3002";
  }
  return "https://salon.trymystyle.com";
}

export const FLUX_REPORT_APP_URL = resolveFluxReportAppUrl();

export function skinReportPdfUrl(resultId: number, token: string): string {
  return `${resolveFluxReportAppUrl()}/api/report/${resultId}/pdf?token=${encodeURIComponent(token)}`;
}

export function hairReportPdfUrl(resultId: number, token: string): string {
  return `${resolveFluxReportAppUrl()}/api/hair-report/${resultId}/pdf?token=${encodeURIComponent(token)}`;
}

/** Trigger a same-tab-free download via a hidden anchor, matching the
 * customer kiosk's own download trigger. Works cross-origin because it's a
 * navigation, not a fetch — the server's Content-Disposition header decides
 * the saved filename. */
export function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
