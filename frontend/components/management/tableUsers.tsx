"use client"
import {
    Search,
} from "lucide-react"
import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { EditUserDialog } from "./EditUserDialog"
import { DeleteUserDialog } from "./DeleteUserDialog"

type UserData = {
    id: number
    email: string
    status: "viewer" | "editor"
}



export default function UsersTable() {
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("all")

    const [users, setUsers] = useState<UserData[]>([
        {
            id: 1,
            email: "john.smith@example.com",
            status: "viewer",
        },
        {
            id: 2,
            email: "sarah.johnson@example.com",
            status: "editor",
        },
        {
            id: 3,
            email: "michael.brown@example.com",
            status: "viewer",
        },
        {
            id: 4,
            email: "emma.wilson@example.com",
            status: "editor",
        },
        {
            id: 5,
            email: "david.miller@example.com",
            status: "viewer",
        },
    ])
    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.email
            .toLowerCase()
            .includes(search.toLowerCase())

        const matchesStatus =
            status === "all" || user.status === status

        return matchesSearch && matchesStatus
    })

    function updateUser(
        id: number,
        status: "viewer" | "editor"
    ) {
        setUsers((currentUsers) =>
            currentUsers.map((user) =>
                user.id === id
                    ? { ...user, status }
                    : user
            )
        )
    }

    function deleteUser(id: number) {
        setUsers((currentUsers) =>
            currentUsers.filter((user) => user.id !== id)
        )
    }

    return (
        <div className="space-y-4 bg-white py-10 border-t">

            {/* Filters */}
            <div className="flex items-center gap-3 px-4">
                <div className="relative hidden w-80 md:block">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 pl-9"
                    />
                </div>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter status" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="all">
                            All users
                        </SelectItem>
                        <SelectItem value="viewer">
                            Viewers
                        </SelectItem>
                        <SelectItem value="editor">
                            Editors
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className=" border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell></TableCell>

                                    <TableCell>
                                        {user.email}
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className={
                                                user.status === "editor"
                                                    ? "text-blue-600"
                                                    : "text-gray-500"
                                            }
                                        >
                                            {user.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex  gap-1">
                                            <EditUserDialog
                                                user={user}
                                                onUpdate={updateUser}
                                            />

                                            <DeleteUserDialog
                                                email={user.email}
                                                onDelete={() => deleteUser(user.id)}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="text-center py-8"
                                >
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

        </div>
    )
}