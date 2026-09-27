import type { MirrorApiResult } from "@/lib/api/mirror/mirror_api";

export type VtoResultService =
  | "hairstyle"
  | "haircolor"
  | "beard"
  | "makeup"
  | "bridal"
  | "clothing";

export const VTO_RESULT_SERVICE_LABELS: Record<VtoResultService, string> = {
  hairstyle: "Hairstyle",
  haircolor: "Haircolour",
  beard: "Beard",
  makeup: "Makeup",
  bridal: "Bridal",
  clothing: "Clothing",
};

const MAKEUP_TYPE_LABELS: Record<string, string> = {
  lipstick: "Lipstick",
  blush: "Blush",
  eyeshadow: "Eye Shadow",
};

/** Same classification as the backend `_vto_category`, plus clothing. */
export function vtoResultService(r: MirrorApiResult): VtoResultService {
  if (r.is_clothing) return "clothing";
  if (r.is_makeup) {
    return (r.makeup_type ?? "").trim().toLowerCase() === "bridal" ? "bridal" : "makeup";
  }
  if (r.is_haircolor) return "haircolor";
  if (r.is_beard) return "beard";
  return "hairstyle";
}

/** "Red · Pink" + "lipstick,blush" → "Red Lipstick, Pink Blush". */
function makeupValue(name: string, makeupType: string): string {
  const types = makeupType
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const shades = name
    .split("·")
    .map((p) => p.trim())
    .filter(Boolean);
  if (shades.length === 0) return "";

  return shades
    .map((shade, i) => {
      const typeLabel = MAKEUP_TYPE_LABELS[types[i] ?? ""];
      if (!typeLabel || shade.toLowerCase().includes(typeLabel.toLowerCase())) return shade;
      return `${shade} ${typeLabel}`;
    })
    .join(", ");
}

/** The style/shade part of the label, e.g. "Ash Blonde" or "Red Lipstick, Pink Blush". */
export function vtoResultValue(r: MirrorApiResult): string {
  const name = (r.hairstyle_name ?? "").trim();
  if (vtoResultService(r) === "makeup") return makeupValue(name, r.makeup_type ?? "");
  return name;
}

/** "Haircolour - Ash Blonde". Falls back to just the service when there is no name. */
export function vtoResultLabel(r: MirrorApiResult): string {
  const service = VTO_RESULT_SERVICE_LABELS[vtoResultService(r)];
  const value = vtoResultValue(r);
  return value ? `${service} - ${value}` : service;
}
