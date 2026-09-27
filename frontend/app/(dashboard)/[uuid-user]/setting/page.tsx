"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsProfile() {
  const [email, setEmail] = useState("hamza@example.com")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // First two characters of email
  const initials = email
    .slice(0, 2)
    .toUpperCase()

  function handleEmailUpdate() {
    console.log("Update email:", email)
  }

  function handlePasswordUpdate() {
    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match")
      return
    }

    console.log("Update password")
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8  border 
     bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px]">

      {/* Header */}
      <div className=" border-b p-6 bg-white">
        <h1 className="text-2xl font-semibold">
          Settings
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage your account and security settings.
        </p>
      </div>

      {/* Profile */}
      <section className=" border-x-0 border bg-background p-6">

        <div className="p-6">

          <h2 className="text-lg font-semibold">
            Profile
          </h2>

          <p className="text-sm text-muted-foreground">
            Manage your account information.
          </p>

          {/* Avatar */}
          <div className="mt-6 flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {initials}
            </div>

            <div>
              <p className="font-medium">
                {email}
              </p>

              <p className="text-sm text-muted-foreground">
                Your account
              </p>
            </div>

          </div>

        </div>

        <Separator />

        {/* Email */}
        <div className="space-y-4 p-6">

          <div>
            <Label htmlFor="email">
              Email address
            </Label>

            <p className="mt-1 text-sm text-muted-foreground">
              This email is used to access your account.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1">

              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="pl-9"
              />

            </div>

            <Button onClick={handleEmailUpdate}>
              Change email
            </Button>

          </div>

        </div>

      </section>

      {/* Password */}
      <section className=" border-x-0 border-b-0  border bg-background p-6">

        <div className="p-6">

          <h2 className="text-lg font-semibold">
            Password
          </h2>

          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure.
          </p>

        </div>

        <Separator />

        <div className="space-y-5 p-6">

          {/* Current password */}
          <div className="space-y-2">

            <Label htmlFor="current-password">
              Current password
            </Label>

            <div className="relative">

              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                className="pl-9 pr-10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrent(!showCurrent)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>

            </div>

          </div>

          {/* New password */}
          <div className="space-y-2">

            <Label htmlFor="new-password">
              New password
            </Label>

            <div className="relative">

              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                className="pl-9 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>

            </div>

          </div>

          {/* Confirm password */}
          <div className="space-y-2">

            <Label htmlFor="confirm-password">
              Confirm new password
            </Label>

            <div className="relative">

              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="pl-9 pr-10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(!showConfirm)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>

            </div>

          </div>

          <div className="flex justify-end pt-2">

            <Button onClick={handlePasswordUpdate}>
              Update password
            </Button>

          </div>

        </div>

      </section>

    </div>
  )
}