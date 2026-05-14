"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
}

export function DataTableToolbar<TData>({
    table,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Input
                    placeholder="Filter products..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="h-9 min-w-0 w-full sm:h-8 sm:max-w-[200px] md:max-w-[280px]"
                />
                {table.getColumn("brand") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("brand")}
                        title="Brand"
                        options={[
                            { label: "Minimilist", value: "Minimilist" },
                            { label: "Other", value: "Other" },
                        ]}
                    />
                )}
                {table.getColumn("gender") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("gender")}
                        title="Gender"
                        options={[
                            { label: "Male", value: "male" },
                            { label: "Female", value: "female" },
                            { label: "Unisex", value: "unisex" },
                        ]}
                    />
                )}
                {table.getColumn("is_active") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("is_active")}
                        title="Status"
                        options={[
                            { label: "Active", value: "true" },
                            { label: "Inactive", value: "false" },
                        ]}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-9 shrink-0 px-2 sm:h-8 lg:px-3"
                    >
                        Reset
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    )
} 