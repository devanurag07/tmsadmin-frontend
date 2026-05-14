"use client"
import api from '@/lib/api/axios_api'
import React, { useEffect, useMemo, useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { getProductColumns, Product, ProductActionsMenu } from './columns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { demoProducts } from './demo-data'
import { AddProductDialog } from './add-product-dialog'
import { UpdateProductDialog } from './update-product-dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import Image from 'next/image'

const Page = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [usingDemoData, setUsingDemoData] = useState(false)
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [openEdit, setOpenEdit] = useState(false);

    const getProducts = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get("/salon/products/")
            setProducts(response.data)
            setUsingDemoData(false)
        } catch (err) {
            console.error('Error fetching products:', err)
            setError('Failed to fetch products from API. Using demo data instead.')
            setProducts(demoProducts)
            setUsingDemoData(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getProducts()
    }, [])

    const handleProductAdded = () => {
        // Refresh the products list after adding a new product
        getProducts()
    }

    const columns = getProductColumns({ onProductDeleted: handleProductAdded, setOpenEdit: setOpenEdit, setEditProduct: setEditProduct });

    const [mobileSearch, setMobileSearch] = useState("")

    const mobileFiltered = useMemo(() => {
        const t = mobileSearch.trim().toLowerCase()
        if (!t) return products
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(t) ||
                p.brand.toLowerCase().includes(t) ||
                String(p.price).includes(t)
        )
    }, [products, mobileSearch])

    if (loading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-[200px]" />
                        <Skeleton className="h-4 w-[300px]" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full min-w-0 max-w-full space-y-6">
            <Card className="min-w-0 gap-0 overflow-hidden border-0 py-0 shadow-lg">
                <CardHeader className="space-y-0 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 max-w-full">
                            <CardTitle className="text-xl font-bold text-foreground break-words sm:text-2xl">
                                Product Catalog
                            </CardTitle>
                            <CardDescription className="mt-2 max-w-full text-pretty break-words leading-relaxed text-muted-foreground">
                                Manage your TryMyStyle salon products with sorting, filters, and inventory control.
                                {usingDemoData && (
                                    <span className="mt-2 block font-medium text-warning-600">
                                        ⚠️ Using demo data - API connection failed
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <div className="w-full shrink-0 md:w-auto md:self-start [&_button]:h-10 [&_button]:w-full [&_button]:touch-manipulation md:[&_button]:h-9 md:[&_button]:w-auto">
                            <AddProductDialog onProductAdded={handleProductAdded} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="min-w-0 p-3 sm:p-6">
                    {error && !usingDemoData && (
                        <div className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4">
                            <p className="text-sm font-medium text-error-700">{error}</p>
                            <button
                                onClick={getProducts}
                                className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90"
                            >
                                Retry Connection
                            </button>
                        </div>
                    )}

                    <div className="md:hidden">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, brand, or price…"
                                value={mobileSearch}
                                onChange={(e) => setMobileSearch(e.target.value)}
                                className="h-11 min-w-0 pl-9 touch-manipulation"
                            />
                        </div>
                        {mobileFiltered.length === 0 ? (
                            <p className="py-10 text-center text-sm text-muted-foreground">
                                {products.length === 0
                                    ? "No products yet. Add one to get started."
                                    : "No products match your search."}
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {mobileFiltered.map((p) => (
                                    <li key={p.id}>
                                        <Card className="overflow-hidden border shadow-sm">
                                            <CardContent className="flex gap-3 p-4">
                                                <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    {p.image && p.image.trim().length > 0 ? (
                                                        <Image
                                                            src={p.image}
                                                            alt=""
                                                            width={144}
                                                            height={144}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-[0.65rem] text-muted-foreground">
                                                            No image
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-1 pr-1">
                                                    <p className="font-semibold leading-snug break-words">
                                                        {p.name}
                                                    </p>
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        {p.brand}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                                        <Badge variant={p.is_active ? "default" : "secondary"}>
                                                            {p.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                        <span className="text-sm font-semibold tabular-nums">
                                                            {new Intl.NumberFormat(undefined, {
                                                                maximumFractionDigits: 0,
                                                            }).format(p.price)}
                                                        </span>
                                                        <span className="text-xs capitalize text-muted-foreground">
                                                            {p.gender}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ProductActionsMenu
                                                    product={p}
                                                    onProductDeleted={handleProductAdded}
                                                    setOpenEdit={setOpenEdit}
                                                    setEditProduct={setEditProduct}
                                                    triggerClassName="h-10 w-10"
                                                />
                                            </CardContent>
                                        </Card>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="hidden min-w-0 md:block">
                        <DataTable columns={columns} data={products} compactOnMobile />
                    </div>
                </CardContent>
            </Card>

            {editProduct && openEdit && (
                <UpdateProductDialog open={openEdit} setOpen={setOpenEdit} product={editProduct} onProductUpdated={() => {
                    handleProductAdded();
                }} />
            )}
        </div>
    )
}

export default Page