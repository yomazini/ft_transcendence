import { Checkbox } from "@/components/ui/checkbox";
import SectionTitle from "./SectionTitle";
import { ArrowDownUp, ArrowLeft, ArrowRight, ChevronDown, MoreHorizontal, ShoppingBasket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export default function ListUesrs()
{
    const products = [
        {
            email: "AeroBeat@Earbuds",
            jobs: 4,
            status: "viwer",
        },
        {
            email: "DataDrive@Secure",
            jobs: 4,
            status: "editer",
        },
        {
            email: "FlexBook@Infinity",
            jobs: 4,
            status: "viwer",
        },
        {
            email: "PulseFit@Tracker",
            jobs: 3,
            status: "editer",
        },
    ];


    return (
        <div className="min-w-0  xl:col-span-2  ">
                <SectionTitle icon={ShoppingBasket}>
                    Top Selling Products
                </SectionTitle>

                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[650px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b text-xs text-muted-foreground">
                                <th className="w-10 px-3 py-3">
                                    <Checkbox aria-label="Select all products" />
                                </th>
                                <th className="px-3 py-3 font-medium">
                                    <span className="inline-flex items-center gap-1">
                                        Item <ArrowDownUp className="size-3.5" />
                                    </span>
                                </th>
                                <th className="px-3 py-3 font-medium">
                                    <span className="inline-flex items-center gap-1">
                                        Jobs <ArrowDownUp className="size-3.5" />
                                    </span>
                                </th>
                                <th className="px-3 py-3 font-medium">
                                    <span className="inline-flex items-center gap-1">
                                        Status <ArrowDownUp className="size-3.5" />
                                    </span>
                                </th>
                                <th className="px-3 py-3 text-right font-medium">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {products.map((product) => (
                                <tr key={product.email} className="transition-colors hover:bg-muted/40">
                                    <td className="px-3 py-4">
                                        <Checkbox aria-label={`Select ${product.email}`} />
                                    </td>

                                    <td className="px-3 py-4">
                                        <p className="whitespace-nowrap text-xs font-medium sm:text-sm">
                                            {product.email}
                                        </p>
                                    </td>

                                    

                                    <td className="whitespace-nowrap px-3 py-4 text-xs text-muted-foreground">
                                        {product.jobs}
                                    </td>

                                    <td className="px-3 py-4">
                                        <Badge
                                            variant="secondary"
                                            className={
                                                product.status === "editer"
                                                    ? "whitespace-nowrap border-0 bg-teal-50 text-teal-700"
                                                    : "whitespace-nowrap border-0 bg-orange-50 text-orange-600"
                                            }
                                        >
                                            {product.status}
                                        </Badge>
                                    </td>

                                    <td className="px-3 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Actions for ${product.name}`}
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table pagination */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        Show
                        <Button variant="outline" size="sm" className="h-8">
                            5 <ChevronDown className="ml-2 size-3" />
                        </Button>
                        per page
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>1-4 of 4</span>
                        <Button variant="ghost" size="icon" className="size-8" disabled>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="size-8">
                            1
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8" disabled>
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
    )
}



