"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { backendEndpoint } from "../constants";
import { CircularProgress, Paper, Typography } from "@mui/material";
import { Graph } from "@/components/graph";

const sum = (a: number, b: number) => a + b;
const pln =new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" })

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
    console.log(data);

    const energyProd = data["Predicted energy production"];
    const energyConsumption = data["Predicted energy consumption"];

    const energyBalance = energyProd.map((_, i) => energyProd[i] - energyConsumption[i]);

    const sumOver = energyBalance.filter((x) => x > 0).reduce(sum, 0);
    const sumUnder = energyBalance.filter((x) => x < 0).reduce(sum, 0);

    const energyGivenToGrid = sumOver - (energyConsumption.reduce(sum, 0) + sumUnder)
    const energyFetchedDirectly = energyConsumption.reduce(sum, 0) + sumUnder

    const costWithSolar =
        -1 * sumUnder * query["cost_per_kwh"] -
        energyGivenToGrid * query["income_per_kwh"] +
        query["transfer_cost"];
    const costWithoutSolar =
        energyConsumption.reduce(sum, 0) * query["cost_per_kwh"] + query["transfer_cost"];

    const savedMoney = costWithoutSolar - costWithSolar;

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
                unit="kWh"
                {...dirtyHackProps}
            />
            <Graph
                color="orange"
                data={energyConsumption}
                label="Konsumpcja energii"
                unit="kWh"
                {...dirtyHackProps}
            />
            <Graph
                color="red"
                data={energyBalance}
                label="Bilans energii"
                unit="kWh"
                {...dirtyHackProps}
            />
            <Paper>
                <Typography display="block" variant="h2" align="center">
                    Zaoszczędzisz: {pln.format(savedMoney)}
                </Typography>
                <Typography display="block" align="center">
                    Opłata po inwestycji w fotowoltaikę: {pln.format(costWithSolar)}
                </Typography>
                <Typography display="block" align="center">
                    Opłata bez inwestycji w fotowoltaikę: {pln.format(costWithoutSolar)}
                </Typography>
                <Typography display="block" align="center">
                    Liczba wyprodukowanych kWh: {sumOver.toFixed(2)}                    
                </Typography>
                <Typography display="block" align="center">
                    Liczba kWh pobranych z sieci: {(-1 * sumUnder).toFixed(2)}                    
                </Typography>
                <Typography display="block" align="center">
                    Liczba kWh oddanych do sieci: {energyGivenToGrid.toFixed(2)}                    
                </Typography>

                <Typography display="block" align="center">
                    Liczba kWh pobranych bezpośrednio z fotowoltaiki: {energyFetchedDirectly.toFixed(2)}                    
                </Typography>

            </Paper>
            <Paper>
                <Typography display="block" align="center">
                    =============================================================
                                       
                </Typography>
                <Typography display="block" align="center" sx={{ fontWeight: 'bold' }}>
                    Params:           
                </Typography>
                <Typography display="block" align="center">
                    Miesiąc: {query["month"]}, Rok: {query["year"]}, Zużycie energii: {query["energy_usage"]}, 
                    Cena oddanej energii: {query["income_per_kwh"]}, Cena pobranej energii: {query["cost_per_kwh"]},
                    Koszty stałe: {query["transfer_cost"]}, Długość geograficzna: {query["latitude"]},
                    Szerokość geograficzna: {query["longitude"]}
                </Typography>
            </Paper>

        </div>
    );
}
