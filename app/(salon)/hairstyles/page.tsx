"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomHairstylesManager } from "@/components/hairstyles/CustomHairstylesManager";
import { salonCustomHairstylesApi, uploadHairstyleImage } from "@/lib/api/hairstyles/custom_hairstyles_api";
import { useTranslation } from "@/lib/i18n/language-provider";

export default function CustomHairstylesPage() {
  const { t } = useTranslation();

  return (
    <div className="w-full min-w-0 space-y-6">
      <Card className="min-w-0 gap-0 overflow-hidden border-0 py-0 shadow-lg">
        <CardHeader className="space-y-0 p-4 sm:p-6">
          <CardTitle className="text-xl font-bold sm:text-2xl">{t("hairstyles.title")}</CardTitle>
          <CardDescription className="mt-2">{t("hairstyles.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 p-3 sm:p-6">
          <CustomHairstylesManager api={salonCustomHairstylesApi} upload={uploadHairstyleImage} />
        </CardContent>
      </Card>
    </div>
  );
}
