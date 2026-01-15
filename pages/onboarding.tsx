"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore, type HabitType } from "@/lib/store"
import { useTrackEvent } from "@journium/nextjs"
import { toast } from "sonner"
import { Dumbbell, Brain, Droplets, Moon, Footprints, Coffee, Clock } from "lucide-react"

type Goal = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
}

type HabitOption = {
  id: string
  title: string
  type: HabitType
  icon: React.ComponentType<{ className?: string }>
  target?: number
  unit?: string
}

const goals: Goal[] = [
  { id: "sleep", title: "Sleep better", icon: Moon },
  { id: "fitness", title: "Get fitter", icon: Dumbbell },
  { id: "stress", title: "Reduce stress", icon: Brain },
  { id: "hydration", title: "Drink more water", icon: Droplets },
]

const habitOptions: HabitOption[] = [
  { id: "walk", title: "Walk 20 minutes", type: "walk", icon: Footprints, target: 20, unit: "min" },
  { id: "water", title: "Drink 2L water", type: "water", icon: Droplets, target: 2000, unit: "ml" },
  { id: "meditate", title: "Meditate 10 min", type: "meditate", icon: Brain, target: 10, unit: "min" },
  { id: "sleep", title: "Sleep by 11pm", type: "sleep", icon: Moon },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { addHabit, updateSettings } = useStore()
  const trackEvent = useTrackEvent()
  const [step, setStep] = useState(1)
  const [selectedGoal, setSelectedGoal] = useState<string>("")
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  const [customHabitName, setCustomHabitName] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [reminderTime, setReminderTime] = useState("09:00")

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step === 1) {
      trackEvent("onboarding_step_1_completed", { goal: selectedGoal })
    } else if (step === 2) {
      trackEvent("onboarding_step_2_completed", { habits: selectedHabits })
    } else if (step === 3) {
      trackEvent("onboarding_step_3_completed", { reminderTime })
    }
    setStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleFinish = () => {
    // Create habits based on selections
    selectedHabits.forEach((habitId) => {
      const habitOption = habitOptions.find((h) => h.id === habitId)
      if (habitOption) {
        addHabit({
          title: habitOption.title,
          type: habitOption.type,
          frequency: "daily",
          target: habitOption.target,
          unit: habitOption.unit,
          active: true,
        })
      }
    })

    // Add custom habit if provided
    if (customHabitName.trim()) {
      addHabit({
        title: customHabitName.trim(),
        type: "custom",
        frequency: "daily",
        active: true,
      })
    }

    toast.success("Your habits are ready!")
    trackEvent("onboarding_completed", { habitCount: selectedHabits.length + (customHabitName ? 1 : 0) })

    router.push("/log")
  }

  const handleNotificationAllow = () => {
    updateSettings({ notificationPermission: "allowed" })
    toast.success("Notifications enabled!")
    trackEvent("notification_permission_granted")
    handleFinish()
  }

  const handleNotificationSkip = () => {
    updateSettings({ notificationPermission: "denied" })
    trackEvent("notification_permission_denied")
    handleFinish()
  }

  const toggleHabit = (habitId: string) => {
    setSelectedHabits((prev) => {
      if (prev.includes(habitId)) {
        return prev.filter((id) => id !== habitId)
      }
      return [...prev, habitId]
    })
  }

  const canProceed = () => {
    if (step === 1) return selectedGoal !== ""
    if (step === 2) return selectedHabits.length > 0 || customHabitName.trim() !== ""
    return true
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome to Looply</CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">What&apos;s your main goal?</h3>
                <CardDescription>Choose what matters most to you right now</CardDescription>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {goals.map((goal) => {
                  const Icon = goal.icon
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all hover:border-primary cursor-pointer ${
                        selectedGoal === goal.id ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          selectedGoal === goal.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-medium">{goal.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Pick your habits</h3>
                <CardDescription>Choose 1-3 habits to get started (you can add more later)</CardDescription>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {habitOptions.map((habit) => {
                  const Icon = habit.icon
                  const isSelected = selectedHabits.includes(habit.id)
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all hover:border-primary cursor-pointer ${
                        isSelected ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-medium">{habit.title}</span>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
                {!showCustomInput ? (
                  <Button variant="ghost" className="w-full cursor-pointer" onClick={() => setShowCustomInput(true)} type="button">
                    + Create custom habit
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="custom-habit">Custom habit name</Label>
                    <Input
                      id="custom-habit"
                      placeholder="e.g., Read 30 pages"
                      value={customHabitName}
                      onChange={(e) => setCustomHabitName(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Set your reminder</h3>
                <CardDescription>When would you like to be reminded about your habits?</CardDescription>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Reminder time</Label>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <Input
                      id="reminder-time"
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="max-w-[200px]"
                    />
                  </div>
                </div>

                <Button variant="ghost" className="w-full cursor-pointer" onClick={handleNext} type="button">
                  Skip for now
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Coffee className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Stay on track with notifications</h3>
                <CardDescription>Get gentle reminders to help you build consistent habits</CardDescription>
              </div>

              <div className="space-y-3">
                <Button onClick={handleNotificationAllow} className="w-full cursor-pointer" size="lg">
                  Allow notifications
                </Button>
                <Button onClick={handleNotificationSkip} variant="ghost" className="w-full cursor-pointer">
                  Not now
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">You can change this later in settings</p>
            </div>
          )}

          {step < 4 && (
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent cursor-pointer">
                  Back
                </Button>
              )}
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1 cursor-pointer">
                {step === 3 ? "Continue" : "Next"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

