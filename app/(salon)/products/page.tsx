"use client"
import api from '@/lib/api/axios_api'
import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { getProductColumns, Product } from './columns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { demoProducts } from './demo-data'
import { AddProductDialog } from './add-product-dialog'
import { UpdateProductDialog } from './update-product-dialog'

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
            const response = await api.get("/products/")
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
        <div className="space-y-6">
            <Card className="shadow-lg border-0">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-foreground">Product Catalog</CardTitle>
                            <CardDescription className="text-muted-foreground mt-2">
                                Manage your TryMyStyle salon products with advanced sorting, filtering, and inventory control.
                                {usingDemoData && (
                                    <span className="block mt-2 text-warning-600 font-medium">
                                        ⚠️ Using demo data - API connection failed
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <AddProductDialog onProductAdded={handleProductAdded} />
                    </div>
                </CardHeader>
                <CardContent>
                    {error && !usingDemoData && (
                        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
                            <p className="text-error-700 text-sm font-medium">{error}</p>
                            <button
                                onClick={getProducts}
                                className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
                            >
                                Retry Connection
                            </button>
                        </div>
                    )}
                    <DataTable columns={columns} data={products} />
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