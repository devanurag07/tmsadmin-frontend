"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ThemeSwitcher } from '@/components/theme-provider'
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

export default function ThemeDemoPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            TryMyStyle Brand Theme Demo
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore the complete brand color palette and component theming
          </p>
        </div>
        <ThemeSwitcher />
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Color Palette</CardTitle>
          <CardDescription>
            All available brand colors and their variations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Primary Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="text-center">
                  <div
                    className={`w-full h-16 rounded-lg mb-2 bg-primary-${shade}`}
                    style={{ backgroundColor: `var(--primary-${shade})` }}
                  />
                  <p className="text-xs font-mono text-muted-foreground">
                    {shade}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Secondary Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="text-center">
                  <div
                    className={`w-full h-16 rounded-lg mb-2 bg-secondary-${shade}`}
                    style={{ backgroundColor: `var(--secondary-${shade})` }}
                  />
                  <p className="text-xs font-mono text-muted-foreground">
                    {shade}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Accent Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="text-center">
                  <div
                    className={`w-full h-16 rounded-lg mb-2 bg-accent-${shade}`}
                    style={{ backgroundColor: `var(--accent-${shade})` }}
                  />
                  <p className="text-xs font-mono text-muted-foreground">
                    {shade}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Different button variants with brand colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-primary">
                Primary
              </Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status and category indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-success text-success-foreground">Success</Badge>
              <Badge className="bg-warning text-warning-foreground">Warning</Badge>
              <Badge className="bg-error text-error-foreground">Error</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Information and status messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is a default alert with brand styling.
              </AlertDescription>
            </Alert>
            <Alert className="border-success bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success-foreground">
                Success message with brand colors.
              </AlertDescription>
            </Alert>
            <Alert className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning-foreground">
                Warning message with brand colors.
              </AlertDescription>
            </Alert>
            <Alert className="border-error bg-error/10">
              <XCircle className="h-4 w-4 text-error" />
              <AlertDescription className="text-error-foreground">
                Error message with brand colors.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Indicators</CardTitle>
            <CardDescription>Loading and completion states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Default Progress</p>
              <Progress value={65} className="w-full" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Success Progress</p>
              <Progress value={85} className="w-full bg-success/20" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Warning Progress</p>
              <Progress value={45} className="w-full bg-warning/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Semantic Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Semantic Colors</CardTitle>
          <CardDescription>
            Colors used for specific purposes and meanings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Success */}
            <div className="space-y-3">
              <h4 className="font-semibold text-success">Success Colors</h4>
              <div className="space-y-2">
                <div className="h-8 bg-success rounded flex items-center px-3">
                  <span className="text-success-foreground text-sm font-medium">Success Background</span>
                </div>
                <div className="h-8 bg-success-50 border border-success-200 rounded flex items-center px-3">
                  <span className="text-success-700 text-sm">Success Light</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="space-y-3">
              <h4 className="font-semibold text-warning">Warning Colors</h4>
              <div className="space-y-2">
                <div className="h-8 bg-warning rounded flex items-center px-3">
                  <span className="text-warning-foreground text-sm font-medium">Warning Background</span>
                </div>
                <div className="h-8 bg-warning-50 border border-warning-200 rounded flex items-center px-3">
                  <span className="text-warning-700 text-sm">Warning Light</span>
                </div>
              </div>
            </div>

            {/* Error */}
            <div className="space-y-3">
              <h4 className="font-semibold text-error">Error Colors</h4>
              <div className="space-y-2">
                <div className="h-8 bg-error rounded flex items-center px-3">
                  <span className="text-error-foreground text-sm font-medium">Error Background</span>
                </div>
                <div className="h-8 bg-error-50 border border-error-200 rounded flex items-center px-3">
                  <span className="text-error-700 text-sm">Error Light</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Information */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Information</CardTitle>
          <CardDescription>
            Details about the current theme configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Brand Colors</h4>
              <div className="space-y-2 text-sm">
                                 <div className="flex items-center space-x-2">
                   <div className="w-4 h-4 bg-primary rounded"></div>
                   <span>Primary: #0d9488</span>
                 </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-secondary rounded"></div>
                  <span>Secondary: #0ea5e9</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-accent rounded"></div>
                  <span>Accent: #d946ef</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Usage</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Use <code className="bg-muted px-1 rounded">bg-primary</code> for main actions</p>
                <p>• Use <code className="bg-muted px-1 rounded">text-foreground</code> for text</p>
                <p>• Use <code className="bg-muted px-1 rounded">border-border</code> for borders</p>
                <p>• Theme automatically adapts to light/dark mode</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 