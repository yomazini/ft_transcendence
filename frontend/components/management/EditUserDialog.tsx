"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type UserData = {
  id: number
  email: string
  status: "viewer" | "editor"
}

type EditUserDialogProps = {
  user: UserData
  onUpdate: (id: number, status: "viewer" | "editor") => void
}

export function EditUserDialog({
  user,
  onUpdate,
}: EditUserDialogProps) {
  const [status, setStatus] = useState(user.status)
  const [open, setOpen] = useState(false)

  function handleSave() {
    onUpdate(user.id, status)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              Role
            </p>

            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as "viewer" | "editor")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="viewer">
                  Viewer
                </SelectItem>

                <SelectItem value="editor">
                  Editor
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
          >
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}