"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useStore } from "@/lib/store"
import { Crown, Bell, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/router"
import { AppLayout } from "@/components/app-layout"

export default function SettingsPage() {
  const router = useRouter()
  const { user, settings, updateSettings, resetData, setUser, upgradeToPro } = useStore()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  const handleSaveProfile = () => {
    if (user) {
      setUser({ ...user, name, email })
      toast.success("Profile updated!")
    }
  }

  const handleToggleNotifications = () => {
    const newStatus = settings.notificationPermission === "allowed" ? "denied" : "allowed"
    updateSettings({ notificationPermission: newStatus })
    toast.success(newStatus === "allowed" ? "Notifications enabled" : "Notifications disabled")
  }

  const handleResetData = () => {
    resetData()
    toast.success("Demo data reset")
    router.push("/auth/sign-in")
  }

  const handleUpgrade = () => {
    upgradeToPro()
    toast.success("Upgraded to Pro! (Demo)")
  }

  return (
    <AppLayout>
      <div className="container max-w-3xl space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button onClick={handleSaveProfile} className="cursor-pointer">Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Current plan</p>
                  {user?.plan === "pro" && <Crown className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.plan === "pro" ? "Pro - Unlimited habits & insights" : "Free - Up to 3 habits"}
                </p>
              </div>
              <Badge variant={user?.plan === "pro" ? "default" : "secondary"} className="uppercase">
                {user?.plan}
              </Badge>
            </div>
            {user?.plan === "free" && (
              <Button className="w-full gap-2 cursor-pointer" onClick={handleUpgrade}>
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            )}
            {user?.plan === "pro" && (
              <Button variant="outline" className="w-full bg-transparent cursor-pointer">
                Manage subscription
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="font-medium">Daily reminders</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.notificationPermission === "allowed" ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.notificationPermission === "allowed"}
                onCheckedChange={handleToggleNotifications}
              />
            </div>
            {settings.notificationPermission === "unknown" && (
              <p className="text-sm text-muted-foreground">Enable notifications to receive daily habit reminders</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Danger Zone</CardTitle>
            </div>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="cursor-pointer">Reset demo data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your demo data including habits, logs, and settings. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetData} className="bg-destructive text-destructive-foreground cursor-pointer">
                    Reset data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

