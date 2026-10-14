import { useState } from "react";
// import ListUesrs from "./listUsers";
import Strategic from "./Strategic";
import { Lightbulb, Target, Waves } from "lucide-react";
import SectionTitle from "./SectionTitle";
import { Download, Users } from "lucide-react";



export default function StrategicUsers({ params }: { params: Promise<{ "uuid-user": string }> }) {

  const totalUsers = 20
  const freeUsers = 15

  const allocatedUsers = totalUsers - freeUsers;
  const percentage = totalUsers > 0
    ? (allocatedUsers / totalUsers) * 100
    : 0;

  return (
    <section className="grid min-w-0 grid-cols-1 overflow-hidden border xl:grid-cols-3">


      <Strategic params={params} />

      <div className="min-w-0 border-t lg:border-l lg:border-t-0">
        <SectionTitle icon={Lightbulb}>Key Insights</SectionTitle>

        <div className="space-y-2 p-4">
          <div className="flex justify-between items-center">
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl flex items-center ">
              <Users className="size-5 mr-2" /> {totalUsers}
            </p>

            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-emerald-600">5</span>
              <span className="ml-2">available places</span>
            </p>
          </div>


          {/* <div
            className="flex h-5 gap-[3px] overflow-hidden"
            aria-label="Regional performance indicator"
          >
            {Array.from({ length: 48 }).map((_, i) =>
            (
              i < (((totalUsers - freeUsers) * 48) / totalUsers) ?
                <div
                  key={i}
                  className="min-w-[3px] flex-1 rounded-[5px]  bg-[#171717] dark:bg-white"
                /> :
                <div
                  key={i}
                  className="min-w-[3px] flex-1 rounded-[5px]  bg-[#858585]" />

            ))}
          </div> */}

          <div className=" flex  items-center justify-center mt-10">
            <div
              className="relative size-40 rounded-full"
              style={{
                background: `conic-gradient(
                #171717 0% ${percentage}%,
                #858585 ${percentage}% 100%
              )`,
              }}
            >
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white dark:bg-neutral-950">
                <span className="text-3xl font-bold">
                  {percentage.toFixed(0)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  Allocated
                </span>
              </div>
            </div>
          </div>


          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-xs flex  items-center justify-center">
            {[
              ["Allocated", "bg-neutral-900"],
              ["Available", "bg-neutral-500"],
            ].map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 
      <div className="flex flex-col items-center gap-4 p-4">
        <div
          className="relative size-40 rounded-full"
          style={{
            background: `conic-gradient(
        #171717 0% ${percentage}%,
        #858585 ${percentage}% 100%
      )`,
          }}
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white dark:bg-neutral-950">
            <span className="text-3xl font-bold">
              {percentage.toFixed(0)}%
            </span>
            <span className="text-xs text-muted-foreground">
              Allocated
            </span>
          </div>
        </div>

        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-neutral-900" />
            Allocated
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-neutral-500" />
            Available
          </div>
        </div>
      </div> */}




      {/*  */}

      {/* </div> */}
    </section>
  )
}
