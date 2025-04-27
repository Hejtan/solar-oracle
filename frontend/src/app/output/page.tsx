"use client"
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { backendEndpoint } from "../constants";
import { CircularProgress } from "@mui/material";
import { Graph } from "@/components/graph";

export default function Page() {
    const queryParams = useSearchParams()
    const query = useMemo(() => Object.fromEntries(queryParams.entries().map(([key, val]) => [key, Number(val)])), [queryParams])
    
    const [data, setData] = useState<Record<string, number[]>>()
    useEffect(() => {
        console.log(query)
        fetch(backendEndpoint, {
            method: "POST",
            body: JSON.stringify(query)
        }).then(res => res.json()).then(setData)
    }, [query])

    if (!data) return <CircularProgress/>

    const energyProd = data["Predicted energy production"]

    return <div>
        <Graph color="orange" data={energyProd} label="Produkcja energii" unit="kwH" year={data["year"] as unknown as number} month={data["month"] as unknown as number}/>
    </div>
}