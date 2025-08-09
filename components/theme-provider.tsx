"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
export function ThemeProvider({ children, ...props }: any) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Theme switcher component
export function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md bg-white/20 hover:bg-white/30 transition-colors text-white"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}

// Import the useTheme hook
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react" 