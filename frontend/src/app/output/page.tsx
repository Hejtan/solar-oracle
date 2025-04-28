"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { backendEndpoint } from "../constants";
import { CircularProgress, Paper, Typography } from "@mui/material";
import { Graph } from "@/components/graph";

const sum = (a: number, b: number) => a + b

export default function Page() {
    const queryParams = useSearchParams();
    const query = useMemo(
        () => Object.fromEntries(queryParams.entries().map(([key, val]) => [key, Number(val)])),
        [queryParams]
    );

    const [data, setData] = useState<Record<string, number[]>>();
    useEffect(() => {
        console.log(query);
        fetch(backendEndpoint, {
            method: "POST",
            body: JSON.stringify(query),
        })
            .then((res) => res.json())
            .then(setData);
    }, [query]);

    if (!data) return <CircularProgress />;
    console.log(data)

    const energyProd = data["Predicted energy production"];
    const energyConsumption = data["Predicted energy consumption"]

    const energyBalance = energyProd.map((_, i) => energyProd[i] - energyConsumption[i])

    const sumOver = energyBalance.filter(x => x > 0).reduce(sum, 0)
    const sumUnder = energyBalance.filter(x => x < 0).reduce(sum, 0)

    const costWithSolar = sumUnder * query["cost_per_kwh"] - sumOver * query["income_per_kwh"] + query["transfer_cost"]
    const costWithoutSolar = energyConsumption.reduce(sum, 0) * query["cost_per_kwh"] + query["transfer_cost"]

    const savedMoney = costWithoutSolar - costWithSolar

    const dirtyHackProps = {
        year: data["year"] as unknown as number,
        month: data["month"] as unknown as number,
    } as const;

    return (
        <div>
            <Graph
                color="green"
                data={energyProd}
                label="Produkcja energii"
                unit="kwH"
                {...dirtyHackProps}
            />
            <Graph
                color="orange"
                data={energyConsumption}
                label="Konsumpcja energii"
                unit="kwH"
                {...dirtyHackProps}
            />
            <Graph 
                color="red"
                data={energyBalance}
                label="Bilans energii"
                unit="kwH"
                {...dirtyHackProps}
            />
            <Paper>
                <Typography display="block" variant="h2" align="center">Zaoszczędzisz: {savedMoney}</Typography>
                <Typography display="block">
                    Opłata po inwestycji w fotowoltaikę: {costWithSolar}
                    Opłata bez inwestycji w fotowoltaikę: {costWithoutSolar}
                </Typography>
            </Paper>
        </div>
    );
}
