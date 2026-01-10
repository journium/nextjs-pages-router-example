"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PaywallDialog } from "@/components/paywall-dialog"
import { useStore } from "@/lib/store"
import { track } from "@/lib/analytics"
import { Plus, Archive } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { AppLayout } from "@/components/app-layout"

export default function HabitsPage() {
  const { user, habits, addHabit, updateHabit } = useStore()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [newHabitTitle, setNewHabitTitle] = useState("")
  const [newHabitTarget, setNewHabitTarget] = useState("")
  const [newHabitUnit, setNewHabitUnit] = useState("")

  const activeHabits = habits.filter((h) => h.active)
  const archivedHabits = habits.filter((h) => !h.active)

  const handleAddHabit = () => {
    // Check free plan limit
    if (user?.plan === "free" && activeHabits.length >= 3) {
      setShowPaywall(true)
      track("paywall_shown", { trigger: "habit_limit" })
      return
    }

    setShowAddDialog(true)
  }

  const handleSaveHabit = () => {
    if (!newHabitTitle.trim()) {
      toast.error("Please enter a habit name")
      return
    }

    addHabit({
      title: newHabitTitle.trim(),
      type: "custom",
      frequency: "daily",
      target: newHabitTarget ? Number.parseFloat(newHabitTarget) : undefined,
      unit: newHabitUnit || undefined,
      active: true,
    })

    toast.success("Habit added!")
    track("habit_created", { hasTarget: !!newHabitTarget })

    setShowAddDialog(false)
    setNewHabitTitle("")
    setNewHabitTarget("")
    setNewHabitUnit("")
  }

  const handleArchiveHabit = (id: string) => {
    updateHabit(id, { active: false })
    toast.success("Habit archived")
    track("habit_archived", { habitId: id })
  }

  const handleRestoreHabit = (id: string) => {
    // Check free plan limit
    if (user?.plan === "free" && activeHabits.length >= 3) {
      setShowPaywall(true)
      track("paywall_shown", { trigger: "habit_limit" })
      return
    }

    updateHabit(id, { active: true })
    toast.success("Habit restored")
  }

  return (
    <AppLayout>
      <>
        <div className="container max-w-4xl space-y-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">My Habits</h1>
              <p className="text-muted-foreground">Manage your daily routines</p>
            </div>
            <Button onClick={handleAddHabit} className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              Add Habit
            </Button>
          </div>

          {user?.plan === "free" && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">Free Plan</p>
                  <p className="text-sm text-muted-foreground">{activeHabits.length} of 3 active habits used</p>
                </div>
                <Button
                  variant="default"
                  onClick={() => {
                    setShowPaywall(true)
                    track("paywall_shown", { trigger: "upgrade_card" })
                  }}
                  className="cursor-pointer"
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Active Habits</CardTitle>
              <CardDescription>Your current daily routines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeHabits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">{habit.title}</h4>
                    {habit.target && habit.unit && (
                      <p className="text-sm text-muted-foreground">
                        Target: {habit.target} {habit.unit}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{habit.frequency}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleArchiveHabit(habit.id)}>
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {activeHabits.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No active habits yet. Add your first habit to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {archivedHabits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Archived Habits</CardTitle>
                <CardDescription>Habits you&apos;ve paused</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {archivedHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 opacity-60"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{habit.title}</h4>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRestoreHabit(habit.id)}>
                      Restore
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Habit</DialogTitle>
              <DialogDescription>Create a new habit to track daily</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="habit-title">Habit name</Label>
                <Input
                  id="habit-title"
                  placeholder="e.g., Read 30 pages"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="habit-target">Target (optional)</Label>
                  <Input
                    id="habit-target"
                    type="number"
                    placeholder="e.g., 30"
                    value={newHabitTarget}
                    onChange={(e) => setNewHabitTarget(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="habit-unit">Unit (optional)</Label>
                  <Input
                    id="habit-unit"
                    placeholder="e.g., pages, min"
                    value={newHabitUnit}
                    onChange={(e) => setNewHabitUnit(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1 bg-transparent cursor-pointer">
                  Cancel
                </Button>
                <Button onClick={handleSaveHabit} className="flex-1 cursor-pointer">
                  Add Habit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} trigger="habit_limit" />
      </>
    </AppLayout>
  )
}

