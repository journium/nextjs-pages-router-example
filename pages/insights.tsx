"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaywallDialog } from "@/components/paywall-dialog"
import { useStore } from "@/lib/store"
import { getStreak } from "@/lib/utils-habits"
import { useTrackEvent } from "@journium/nextjs"
import { Crown, TrendingUp, Calendar, Target, Lock } from "lucide-react"
import { useState } from "react"
import { AppLayout } from "@/components/app-layout"

export default function InsightsPage() {
  const { user, habits, logs } = useStore()
  const trackEvent = useTrackEvent()
  const [showPaywall, setShowPaywall] = useState(false)
  const activeHabits = habits.filter((h) => h.active)

  // Calculate week data
  const getWeekData = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - 6) // Last 7 days
    startOfWeek.setHours(0, 0, 0, 0)

    const weekDays: { date: string; count: number; total: number }[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]

      const completedCount = activeHabits.filter((habit) => {
        const log = logs.find((l) => l.habitId === habit.id && l.date === dateStr && l.completed)
        return !!log
      }).length

      weekDays.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        count: completedCount,
        total: activeHabits.length,
      })
    }

    return weekDays
  }

  const weekData = getWeekData()
  const totalCompleted = weekData.reduce((sum, day) => sum + day.count, 0)
  const totalPossible = weekData.reduce((sum, day) => sum + day.total, 0)
  const completionRate = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100)

  // Find best and hardest days
  const bestDay = weekData.reduce((best, day) => (day.count > best.count ? day : best), weekData[0])
  const hardestDay = weekData.reduce((worst, day) => (day.count < worst.count ? day : worst), weekData[0])

  // Most consistent habit
  const habitConsistency = activeHabits.map((habit) => {
    const streak = getStreak(habit, logs)
    const weekLogs = weekData.filter((day) => {
      const dateObj = new Date()
      const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day.date)
      dateObj.setDate(dateObj.getDate() - (dateObj.getDay() - dayIndex))
      const dateStr = dateObj.toISOString().split("T")[0]
      return logs.some((l) => l.habitId === habit.id && l.date === dateStr && l.completed)
    }).length

    return { habit, streak, weekLogs }
  })

  const mostConsistent = habitConsistency.reduce(
    (best, item) => (item.weekLogs > best.weekLogs ? item : best),
    habitConsistency[0],
  )

  const handleUnlockProInsights = () => {
    setShowPaywall(true)
    trackEvent("paywall_shown", { trigger: "pro_insights" })
  }

  return (
    <AppLayout>
      <>
        <div className="container max-w-5xl space-y-6 p-4 md:p-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
            <p className="text-muted-foreground">Your weekly progress and patterns</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Day</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bestDay.date}</div>
                <p className="text-xs text-muted-foreground">
                  {bestDay.count} of {bestDay.total} habits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hardest Day</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hardestDay.date}</div>
                <p className="text-xs text-muted-foreground">
                  {hardestDay.count} of {hardestDay.total} habits
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>Last 7 days habit completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2">
                {weekData.map((day, index) => {
                  const percentage = day.total === 0 ? 0 : (day.count / day.total) * 100
                  return (
                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                      <div className="relative h-32 w-full">
                        <div className="absolute bottom-0 w-full rounded-t-md bg-muted">
                          <div
                            className="w-full rounded-t-md bg-primary transition-all"
                            style={{ height: `${percentage}%`, minHeight: percentage > 0 ? "8px" : "0" }}
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium">{day.date}</div>
                        <div className="text-xs text-muted-foreground">
                          {day.count}/{day.total}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {mostConsistent && (
            <Card>
              <CardHeader>
                <CardTitle>Most Consistent Habit</CardTitle>
                <CardDescription>Your strongest habit this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-lg font-medium">{mostConsistent.habit.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Completed {mostConsistent.weekLogs} of 7 days this week
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {mostConsistent.streak} day streak
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.plan === "free" && (
            <Card className="relative overflow-hidden border-primary/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
              <div className="absolute inset-0 backdrop-blur-sm" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>Pro Insights</CardTitle>
                </div>
                <CardDescription>Unlock deeper analytics with Pro</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-3 rounded-lg border border-border/50 bg-background/50 p-4 opacity-50 blur-sm">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                  <div className="h-32 rounded bg-muted" />
                </div>
                <div className="flex justify-center">
                  <Button onClick={handleUnlockProInsights} size="lg" className="gap-2 cursor-pointer">
                    <Crown className="h-4 w-4" />
                    Upgrade to unlock
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.plan === "pro" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <CardTitle>Pro Insights</CardTitle>
                </div>
                <CardDescription>Advanced analytics for Pro members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Habit Trends</h4>
                  <p className="text-sm text-muted-foreground">
                    Your habits are improving! You&apos;re {completionRate}% consistent this week.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-2xl font-bold">{activeHabits.length}</div>
                    <p className="text-sm text-muted-foreground">Total active habits</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-2xl font-bold">{Math.max(...habitConsistency.map((h) => h.streak), 0)}</div>
                    <p className="text-sm text-muted-foreground">Longest streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} trigger="pro_insights" />
      </>
    </AppLayout>
  )
}

