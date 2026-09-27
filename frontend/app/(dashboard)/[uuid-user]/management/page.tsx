
import UsersTable from "@/components/management/tableUsers";
import {
    Progress,
    ProgressLabel,
    ProgressValue,
} from "@/components/ui/progress"

import {User} from "lucide-react";


export default function SettingPage() {
    type User = {
        id: number
        email: string
        status: "viewer" | "editor"
    }

    const users: User[] = [
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
    ]
    return (
        <div className="border space-y-6 bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="border-b flex justify-between p-5 bg-white">
                <div className="">
                    <label htmlFor="">Invoice List</label>
                </div>
                <div className="">
                    <label htmlFor=" " className="text-sm space-x-1 ">
                        <span>Home</span> <span>/</span> <span className=" items-center text-sm text-forground leading-none opacity-80" >invoice List</span>
                    </label>
                </div>
            </div>
            <div className="bg-white flex justify-between">
                <div className="border  w-full flex justify-around py-6 items-center">
                    <div className="">
                        <label htmlFor="" className="text-3xl" >12</label>
                    <Progress value={56} className="w-full max-w-sm">
                        <ProgressLabel>Counter Users</ProgressLabel>
                        <ProgressValue />
                    </Progress>
                    </div>
                    <div className=" border p-2 rounded-xl">
                        <User className="h-8 w-8 "/>
                    </div>
                </div>
                <div className="border  w-full flex justify-around py-6 items-center">
                    <div className="">
                        <label htmlFor="" className="text-3xl" >12</label>
                    <Progress value={56} className="w-full max-w-sm">
                        <ProgressLabel>Viewers Users</ProgressLabel>
                        <ProgressValue />
                    </Progress>
                    </div>
                    <div className=" border p-2 rounded-xl">
                        <User className="h-8 w-8"/>
                    </div>
                </div>
                <div className="border  w-full flex justify-around py-6 items-center">
                    <div className="">
                        <label htmlFor="" className="text-3xl" >12</label>
                    <Progress value={56} className="w-full max-w-sm">
                        <ProgressLabel>Editors Users</ProgressLabel>
                        <ProgressValue  />
                    </Progress>
                    </div>
                    <div className=" border p-2 rounded-xl ">
                        <User className="h-8 w-8"/>
                    </div>
                </div>
            </div>

            <div className="">
                <UsersTable />
            </div>


        </div>
    )


}



