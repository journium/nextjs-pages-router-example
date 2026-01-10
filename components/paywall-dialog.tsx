"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useStore } from "@/lib/store"
import { track } from "@/lib/analytics"
import { Check, Crown } from "lucide-react"
import { toast } from "sonner"

type PaywallDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: "habit_limit" | "pro_insights" | "upgrade_card"
}

const features = {
  free: ["Up to 3 habits", "Basic insights", "Daily logging", "Streak tracking"],
  pro: [
    "Unlimited habits",
    "Advanced insights",
    "Detailed analytics",
    "Priority support",
    "Custom categories",
    "Export data",
  ],
}

export function PaywallDialog({ open, onOpenChange, trigger = "upgrade_card" }: PaywallDialogProps) {
  const { upgradeToPro } = useStore()

  const handleUpgrade = () => {
    upgradeToPro()
    toast.success("Upgraded to Pro! (Demo)")
    // TODO: track("upgrade_success", { trigger })
    track("upgrade_success", { trigger })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock unlimited habits and powerful insights to accelerate your wellness journey
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 sm:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="space-y-1">
              <h3 className="font-semibold">Free</h3>
              <div className="text-2xl font-bold">$0</div>
            </div>
            <ul className="space-y-2">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 rounded-lg border-2 border-primary bg-primary/5 p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Pro</h3>
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-3xl font-bold">$6.99</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </div>
            <ul className="space-y-2">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button onClick={handleUpgrade} size="lg" className="w-full gap-2 cursor-pointer">
            <Crown className="h-4 w-4" />
            Start Pro (Demo)
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            This is a demo app. No actual payment will be processed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
