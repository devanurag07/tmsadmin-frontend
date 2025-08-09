"use client"

export default function ColorTestPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Color Test Page</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Color Test */}
                <div className="p-6 border rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Primary Color Test</h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-primary rounded"></div>
                            <div>
                                <p className="font-medium">Primary Background</p>
                                <p className="text-sm text-muted-foreground">Using bg-primary class</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded" style={{ backgroundColor: 'var(--primary)' }}></div>
                            <div>
                                <p className="font-medium">Primary Background</p>
                                <p className="text-sm text-muted-foreground">Using CSS variable</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Color Test */}
                <div className="p-6 border rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Sidebar Color Test</h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded" style={{ backgroundColor: 'var(--sidebar)' }}></div>
                            <div>
                                <p className="font-medium">Sidebar Background</p>
                                <p className="text-sm text-muted-foreground">Using CSS variable</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-sidebar rounded"></div>
                            <div>
                                <p className="font-medium">Sidebar Background</p>
                                <p className="text-sm text-muted-foreground">Using bg-sidebar class</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Color Values */}
            <div className="p-6 border rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Current Color Values</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="font-medium">Primary:</p>
                        <p className="text-muted-foreground">#0a6b5f</p>
                    </div>
                    <div>
                        <p className="font-medium">Sidebar:</p>
                        <p className="text-muted-foreground">#0a6b5f</p>
                    </div>
                    <div>
                        <p className="font-medium">Dark Primary:</p>
                        <p className="text-muted-foreground">#007d7d</p>
                    </div>
                    <div>
                        <p className="font-medium">Dark Sidebar:</p>
                        <p className="text-muted-foreground">#007d7d</p>
                    </div>
                </div>
            </div>
        </div>
    )
} 