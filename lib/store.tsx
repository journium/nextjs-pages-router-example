"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Types
export type User = {
  id: string
  name: string
  email: string
  plan: "free" | "pro"
  createdAt: string
}

export type HabitType = "walk" | "water" | "meditate" | "sleep" | "custom"

export type Habit = {
  id: string
  title: string
  type: HabitType
  frequency: "daily"
  target?: number
  unit?: string
  createdAt: string
  active: boolean
}

export type Log = {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
  value?: number
  completed: boolean
  createdAt: string
}

export type AppSettings = {
  notificationPermission: "unknown" | "allowed" | "denied"
}

type StoreContextType = {
  user: User | null
  habits: Habit[]
  logs: Log[]
  settings: AppSettings
  setUser: (user: User | null) => void
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  addLog: (log: Omit<Log, "id" | "createdAt">) => void
  updateLog: (id: string, updates: Partial<Log>) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  upgradeToPro: () => void
  resetData: () => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  // Use lazy initialization to load from localStorage
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window === "undefined") return null
    const userData = localStorage.getItem("looply_user")
    return userData ? JSON.parse(userData) : null
  })
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window === "undefined") return []
    const habitsData = localStorage.getItem("looply_habits")
    return habitsData ? JSON.parse(habitsData) : []
  })
  const [logs, setLogs] = useState<Log[]>(() => {
    if (typeof window === "undefined") return []
    const logsData = localStorage.getItem("looply_logs")
    return logsData ? JSON.parse(logsData) : []
  })
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") {
      return { notificationPermission: "unknown" }
    }
    const settingsData = localStorage.getItem("looply_settings")
    return settingsData ? JSON.parse(settingsData) : { notificationPermission: "unknown" }
  })
  const [isLoaded] = useState(() => typeof window !== "undefined")

  // Save to localStorage on changes
  useEffect(() => {
    if (!isLoaded) return
    if (user) {
      localStorage.setItem("looply_user", JSON.stringify(user))
    } else {
      localStorage.removeItem("looply_user")
    }
  }, [user, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem("looply_habits", JSON.stringify(habits))
  }, [habits, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem("looply_logs", JSON.stringify(logs))
  }, [logs, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem("looply_settings", JSON.stringify(settings))
  }, [settings, isLoaded])

  const setUser = (newUser: User | null) => {
    setUserState(newUser)
  }

  const addHabit = (habit: Omit<Habit, "id" | "createdAt">) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setHabits((prev) => [...prev, newHabit])
  }

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit)))
  }

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id))
  }

  const addLog = (log: Omit<Log, "id" | "createdAt">) => {
    const newLog: Log = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setLogs((prev) => [...prev, newLog])
  }

  const updateLog = (id: string, updates: Partial<Log>) => {
    setLogs((prev) => prev.map((log) => (log.id === id ? { ...log, ...updates } : log)))
  }

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const upgradeToPro = () => {
    if (user) {
      setUser({ ...user, plan: "pro" })
    }
  }

  const resetData = () => {
    localStorage.removeItem("looply_user")
    localStorage.removeItem("looply_habits")
    localStorage.removeItem("looply_logs")
    localStorage.removeItem("looply_settings")
    setUserState(null)
    setHabits([])
    setLogs([])
    setSettings({ notificationPermission: "unknown" })
  }

  return (
    <StoreContext.Provider
      value={{
        user,
        habits,
        logs,
        settings,
        setUser,
        addHabit,
        updateHabit,
        deleteHabit,
        addLog,
        updateLog,
        updateSettings,
        upgradeToPro,
        resetData,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}

