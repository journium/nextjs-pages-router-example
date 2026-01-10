"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useStore } from "@/lib/store"
import { getTodayLog } from "@/lib/utils-habits"
import { track } from "@/lib/analytics"
import { CheckCircle2, Sparkles } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/router"
import { AppLayout } from "@/components/app-layout"

export default function LogPage() {
  const { habits, logs, addLog, updateLog } = useStore()
  const router = useRouter()
  const activeHabits = useMemo(() => habits.filter((h) => h.active), [habits])
  const today = new Date().toISOString().split("T")[0]

  // Compute initial values from existing logs using useMemo
  const initialHabitValues = useMemo(() => {
    const values: Record<string, number> = {}
    activeHabits.forEach((habit) => {
      const log = getTodayLog(habit, logs)
      if (log?.value !== undefined) {
        values[habit.id] = log.value
      }
    })
    return values
  }, [activeHabits, logs])

  const [habitValues, setHabitValues] = useState<Record<string, number>>(initialHabitValues)
  const [showCelebration, setShowCelebration] = useState(false)

  // Update values when initial values change
  useEffect(() => {
    setHabitValues(initialHabitValues)
  }, [initialHabitValues])

  const handleToggleHabit = (habitId: string) => {
    const log = getTodayLog(habits.find((h) => h.id === habitId)!, logs)

    if (log) {
      updateLog(log.id, { completed: !log.completed })
      track("habit_logged", { habitId })
    } else {
      addLog({
        habitId,
        date: today,
        completed: true,
      })
      track("habit_logged", { habitId })
    }
  }

  const handleValueChange = (habitId: string, value: number) => {
    setHabitValues((prev) => ({ ...prev, [habitId]: value }))

    const log = getTodayLog(habits.find((h) => h.id === habitId)!, logs)

    if (log) {
      updateLog(log.id, { value })
    } else {
      addLog({
        habitId,
        date: today,
        value,
        completed: false,
      })
    }
  }

  const handleCompleteDay = () => {
    const allCompleted = activeHabits.every((habit) => {
      const log = getTodayLog(habit, logs)
      return log?.completed
    })

    if (allCompleted) {
      setShowCelebration(true)
      track("day_completed")
    }
  }

  const completedCount = activeHabits.filter((habit) => getTodayLog(habit, logs)?.completed).length

  return (
    <AppLayout>
      <>
        <div className="container max-w-3xl space-y-6 p-4 md:p-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Today&apos;s Habits</h1>
            <p className="text-muted-foreground">
              {completedCount} of {activeHabits.length} completed
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Log your habits</CardTitle>
              <CardDescription>Track each habit as you complete them throughout the day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeHabits.map((habit) => {
                const log = getTodayLog(habit, logs)
                const isCompleted = log?.completed || false

                return (
                  <div key={habit.id} className="space-y-3 rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-1 items-start gap-3">
                        <Checkbox
                          id={habit.id}
                          checked={isCompleted}
                          onCheckedChange={() => handleToggleHabit(habit.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <Label
                            htmlFor={habit.id}
                            className={`text-base font-medium ${isCompleted ? "line-through opacity-70" : ""}`}
                          >
                            {habit.title}
                          </Label>
                          {habit.target && habit.unit && (
                            <p className="text-sm text-muted-foreground">
                              Target: {habit.target} {habit.unit}
                            </p>
                          )}
                        </div>
                      </div>
                      {isCompleted && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>

                    {habit.target && habit.unit && (
                      <div className="space-y-2 pl-7">
                        <Label htmlFor={`${habit.id}-value`} className="text-sm text-muted-foreground">
                          Amount ({habit.unit})
                        </Label>
                        <Input
                          id={`${habit.id}-value`}
                          type="number"
                          placeholder={`Enter ${habit.unit}`}
                          value={habitValues[habit.id] || ""}
                          onChange={(e) => handleValueChange(habit.id, Number.parseFloat(e.target.value) || 0)}
                          className="max-w-[200px]"
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              {activeHabits.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No active habits yet. Create your first habit to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {activeHabits.length > 0 && (
            <Button onClick={handleCompleteDay} size="lg" className="w-full cursor-pointer">
              Complete Day
            </Button>
          )}
        </div>

        <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
          <DialogContent className="text-center">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl">Amazing work!</DialogTitle>
              <DialogDescription className="text-base">
                You&apos;ve completed all your habits for today. Keep up the great momentum!
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => {
                  setShowCelebration(false)
                  router.push("/insights")
                }}
                size="lg"
                className="cursor-pointer"
              >
                View Insights
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    </AppLayout>
  )
}

