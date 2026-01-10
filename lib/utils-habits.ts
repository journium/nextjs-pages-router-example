import type { Habit, Log } from "./store"

export function getStreak(habit: Habit, logs: Log[]): number {
  const habitLogs = logs
    .filter((log) => log.habitId === habit.id && log.completed)
    .sort((a, b) => b.date.localeCompare(a.date))

  if (habitLogs.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentDate = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split("T")[0]
    const hasLog = habitLogs.some((log) => log.date === dateStr)

    if (hasLog) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // If it's today or yesterday and no log, check if we should break
      if (i === 0) {
        // Today - no log yet is OK
        currentDate.setDate(currentDate.getDate() - 1)
        continue
      }
      break
    }
  }

  return streak
}

export function getTodayLog(habit: Habit, logs: Log[]): Log | undefined {
  const today = new Date().toISOString().split("T")[0]
  return logs.find((log) => log.habitId === habit.id && log.date === today)
}

export function getWeekProgress(habits: Habit[], logs: Log[]): number {
  if (habits.length === 0) return 0

  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  let totalExpected = 0
  let totalCompleted = 0

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)

    if (date > today) break

    const dateStr = date.toISOString().split("T")[0]

    habits.forEach((habit) => {
      if (!habit.active) return
      totalExpected++
      const log = logs.find((l) => l.habitId === habit.id && l.date === dateStr && l.completed)
      if (log) totalCompleted++
    })
  }

  return totalExpected === 0 ? 0 : Math.round((totalCompleted / totalExpected) * 100)
}

