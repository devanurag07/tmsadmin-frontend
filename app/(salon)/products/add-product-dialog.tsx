"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { get_product_categories, ProductCategory } from "@/lib/api/category/category_api";
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { add_product } from "@/lib/api/products/add_product"
import { upload_product_image } from "@/lib/api/products/upload_image"
import Image from "next/image"
const productFormSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    brand: z.string().min(1, "Brand is required"),
    description: z.string().min(1, "Description is required"),
    gender: z.enum(["male", "female", "unisex"]),
    quantity: z.string().min(1, "Quantity is required"),
    is_active: z.boolean(),
    category: z.string().min(1, "Category is required"),
    sub_category: z.string(),
    price: z.number(),
    image: z.string().min(1, "Image is required")
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface AddProductDialogProps {
    onProductAdded: () => void
}

export function AddProductDialog({ onProductAdded }: AddProductDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<ProductCategory[]>();
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory>();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [imageUploadProgress, setImageUploadProgress] = useState<number>(0);
    const [imageUrl, setImageUrl] = useState<string>("");
    console.log(imageFile);
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            brand: "",
            description: "",
            gender: "unisex",
            quantity: "",
            is_active: true,
            category: "",
            price: 0,
            sub_category: "",
        },
    })

    const get_categories = async () => {
        const data = await get_product_categories();
        if (data.success) {
            if (data.data) {
                setCategories(data.data);
            }
        }
    }

    const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (!validTypes.includes(file.type)) {
                toast.error("Invalid file type. Only jpg, png, and jpeg are allowed.");
                setImageFile(null);
                setImagePreview(null);
                setImageUrl("");
                setImageUploadProgress(0);
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setImageUploading(true);
            setImageUploadProgress(0);
            setImageUrl("");

            const uploadRes = await upload_product_image(file, 0, (percent) => {
                setImageUploadProgress(percent);
            });
            setImageUploading(false);
            if (
                uploadRes &&
                typeof uploadRes === 'object' &&
                'success' in uploadRes &&
                'data' in uploadRes &&
                (uploadRes as any).success &&
                (uploadRes as any).data
            ) {

                //escape the space and special characters
                const imageUrl = encodeURI((uploadRes as any).data);
                setImageUrl(imageUrl);
                form.setValue('image', (uploadRes as any).data);
                toast.success("Image uploaded successfully");
            } else {
                setImageUrl("");
                setImageFile(null);
                setImagePreview(null);
                setImageUploadProgress(0);
                toast.error((uploadRes && typeof uploadRes === 'object' && 'message' in uploadRes && (uploadRes as any).message) || "Image upload failed");
            }
        }
    };

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setLoading(true)
            if (!imageUrl) {
                toast.error("Please upload a product image before submitting.");
                setLoading(false);
                return;
            }
            const response = await add_product({
                name: data.name,
                brand: data.brand,
                category: Number.parseInt(data.category),
                sub_category: Number.parseInt(data.sub_category),
                description: data.description,
                image: imageUrl,
                quantity: data.quantity,
                gender: data.gender,
                price: data.price
            })
            if (response.success) {
                onProductAdded();
            }
            toast.success("Product created successfully!")
            form.reset()
            setImageFile(null);
            setImagePreview(null);
            setImageUrl("");
            setImageUploadProgress(0);
            setOpen(false)
            onProductAdded()
        } catch (error) {
            console.error("Error creating product:", error)
            toast.error("Failed to create product. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        get_categories();
    }, [])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new product. Click save when you are done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter product name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter brand name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter product description"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Image upload input */}
                        <div className="flex flex-col gap-2">
                            <label className="font-medium">Product Image</label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={onImageChange}
                                disabled={loading || imageUploading}
                            />
                            {imagePreview && (
                                <Image src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded border mt-2" />
                            )}
                            {imageUploading && (
                                <div className="w-32 mt-2">
                                    <div className="h-2 bg-gray-200 rounded">
                                        <div
                                            className="h-2 bg-blue-500 rounded"
                                            style={{ width: `${imageUploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs">Uploading: {imageUploadProgress}%</span>
                                </div>
                            )}
                            {imageUrl && !imageUploading && (
                                <span className="text-xs text-green-600">Image uploaded!</span>
                            )}
                            <div className="error text-red-500">
                                {form.getFieldState('image')?.error?.message}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="unisex">Unisex</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 30ML" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={(value: string) => {
                                            if (categories) {
                                                const category_id = Number.parseInt(value);
                                                const selected_category = categories.find((category) => category.id == category_id);
                                                if (selected_category) {
                                                    setSelectedCategory(selected_category);
                                                    field.onChange(value);
                                                }
                                            }
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories?.map((category) => {
                                                    return <SelectItem value={category.id.toString()} key={category.id}>{category.name}</SelectItem>
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="sub_category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sub-Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sub-category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {selectedCategory?.sub_categories.map((category) => {
                                                return <SelectItem value={category.id.toString()} key={category.id}>{category.name}</SelectItem>
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>

                            )}
                        />

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter price" {...field} onChange={(e) => field.onChange(Number.parseInt(e.target.value.replace(/[^0-9.]/g, '')))} type="number" />
                                    </FormControl>
                                </FormItem>

                            )}
                        />
                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Active Status</FormLabel>
                                        <FormDescription>
                                            Enable this to make the product available for purchase
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Product"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 