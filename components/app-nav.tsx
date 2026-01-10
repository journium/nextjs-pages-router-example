"use client"

import { cn } from "@/lib/utils"
import { Home, ListTodo, BarChart3, SettingsIcon, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"

const navItems = [
  {
    title: "Home",
    href: "/home",
    icon: Home,
  },
  {
    title: "Habits",
    href: "/habits",
    icon: ListTodo,
  },
  {
    title: "Log",
    href: "/log",
    icon: CheckCircle,
  },
  {
    title: "Insights",
    href: "/insights",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
]

export function AppNav({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = router.pathname

  return (
    <nav className={cn("flex flex-col gap-1 p-4", className)}>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppNavMobile() {
  const router = useRouter()
  const pathname = router.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
