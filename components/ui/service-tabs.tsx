"use client";

import * as React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Prominent tab bar for the Virtual Try-On / Skin / Hair sections.
 * Shared by the superadmin, chains-admin and tms-admin panels so the tabs look the same everywhere.
 */
export function ServiceTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={cn(
        "h-auto w-full flex-wrap justify-start gap-1 rounded-xl border bg-muted/60 p-1 sm:w-fit",
        className
      )}
      {...props}
    />
  );
}

export function ServiceTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        "h-auto flex-none gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground",
        "hover:bg-background/60 hover:text-foreground",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
        "dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground",
        className
      )}
      {...props}
    />
  );
}
