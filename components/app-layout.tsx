"use client"

import type React from "react"

import { AppHeader } from "@/components/app-header"
import { AppNav, AppNavMobile } from "@/components/app-nav"
import { useStore } from "@/lib/store"
import { useRouter } from "next/router"
import { useEffect } from "react"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/sign-in")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r border-border bg-card md:block">
          <AppNav />
        </aside>
        <main className="flex-1 pb-20 md:pb-6">{children}</main>
      </div>
      <AppNavMobile />
    </div>
  )
}

