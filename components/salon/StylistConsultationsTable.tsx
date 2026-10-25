"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StylistConsultations } from "@/lib/api/salon/dashboard_api";

interface StylistConsultationsTableProps {
  rows: StylistConsultations[];
}

/** Consultations per stylist for the dashboard's active date filter. */
export function StylistConsultationsTable({ rows }: StylistConsultationsTableProps) {
  const total = rows.reduce((sum, row) => sum + row.consultations, 0);

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Consultations per stylist</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Mirror consultations started with each stylist selected on the kiosk.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stylist</TableHead>
            <TableHead className="text-right">Consultations</TableHead>
            <TableHead className="text-right">Share</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.stylist_id}>
              <TableCell className="font-medium">
                <span className="flex items-center gap-2">
                  {row.name}
                  {!row.is_active ? (
                    <Badge variant="secondary" className="text-xs">
                      Removed
                    </Badge>
                  ) : null}
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.consultations}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {total > 0 ? `${Math.round((row.consultations / total) * 100)}%` : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
