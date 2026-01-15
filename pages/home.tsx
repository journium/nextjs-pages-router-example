"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaywallDialog } from "@/components/paywall-dialog"
import { useStore } from "@/lib/store"
import { getStreak, getTodayLog, getWeekProgress } from "@/lib/utils-habits"
import { Flame, TrendingUp, Zap, Crown, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useTrackEvent } from "@journium/nextjs"
import { AppLayout } from "@/components/app-layout"

export default function HomePage() {
  const { user, habits, logs } = useStore()
  const trackEvent = useTrackEvent()
  const [showPaywall, setShowPaywall] = useState(false)

  const activeHabits = habits.filter((h) => h.active)
  const weekProgress = getWeekProgress(activeHabits, logs)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const handleUpgradeClick = () => {
    setShowPaywall(true)
    trackEvent("paywall_shown", { trigger: "upgrade_card" })
  }

  if (activeHabits.length === 0) {
    return (
      <AppLayout>
        <div className="container max-w-4xl p-4 md:p-6">
          <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="max-w-md text-center">
              <CardHeader>
                <CardTitle>Start your journey</CardTitle>
                <CardDescription>Create your first habit to begin tracking your wellness</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/onboarding">
                  <Button size="lg" className="cursor-pointer">Get started</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <>
        <div className="container max-w-5xl space-y-6 p-4 md:p-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {getGreeting()}, {user?.name}
            </h1>
            <p className="text-muted-foreground">Here&apos;s your progress today</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weekProgress}%</div>
                <p className="text-xs text-muted-foreground">Completion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeHabits.length}</div>
                <p className="text-xs text-muted-foreground">Daily routines</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.max(...activeHabits.map((h) => getStreak(h, logs)), 0)}</div>
                <p className="text-xs text-muted-foreground">Days in a row</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Habits</CardTitle>
              <CardDescription>Track your progress for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeHabits.map((habit) => {
                const todayLog = getTodayLog(habit, logs)
                const streak = getStreak(habit, logs)
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{habit.title}</h4>
                        {todayLog?.completed && <Badge variant="secondary">Done</Badge>}
                      </div>
                      {streak > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Flame className="h-3 w-3" />
                          <span>{streak} day streak</span>
                        </div>
                      )}
                    </div>
                    <Link href="/log">
                      <Button variant={todayLog?.completed ? "outline" : "default"} size="sm" className="cursor-pointer">
                        {todayLog?.completed ? "View" : "Log"}
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {user?.plan === "free" && (
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <CardTitle>Upgrade to Pro</CardTitle>
                </div>
                <CardDescription>Unlock unlimited habits and advanced insights</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="gap-2 cursor-pointer" onClick={handleUpgradeClick}>
                  See Pro features
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} trigger="upgrade_card" />
      </>
    </AppLayout>
  )
}

