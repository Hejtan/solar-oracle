"use client";
import { FormEvent } from "react";
import { Box, Button, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const unit = (unit: string) => ({
    input: {
        endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
    },
    htmlInput: { step: 0.01}
} as const);

export default function Home() {
    const router = useRouter();
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query = new URLSearchParams(new FormData(e.nativeEvent.target as any) as any);
        console.log(query);
        router.push("/output" + "?" + query);
    };

    return (
        <div>
            <main>
                <form onSubmit={onSubmit}>
                    <Paper elevation={10} sx={{ margin: "auto", maxWidth: 600, mt: 2 }}>
                        <Typography variant="h3" align="center">Kalkulator</Typography>
                        <Stack p={1} direction="row">
                            <TextField sx={{flexGrow: 1}} type="number" label="miesiąc" name="month" />
                            <TextField sx={{flexGrow: 1}} type="number" label="rok" name="year" />
                        </Stack>
                        <Box p={1}>
                            <TextField fullWidth
                                type="number"
                                label="Ilość zużytej energii w tym miesiącu"
                                name="energy_usage"
                                slotProps={unit("kWh")}
                            />
                        </Box>
                        <Box p={1}>
                            <TextField fullWidth
                                type="number"
                                label="zysk z oddania kWh"
                                name="income_per_kwh"
                                slotProps={unit("zł")}
                            />
                        </Box>
                        <Box p={1}>
                            <TextField fullWidth
                                type="number"
                                label="Koszt z pobrania kWh"
                                name="cost_per_kwh"
                                slotProps={unit("zł")}
                            />
                        </Box>
                        <Box p={1}>
                            <TextField fullWidth
                                type="number"
                                label="Koszt przesyłu"
                                name="transfer_cost"
                                slotProps={unit("zł")}
                            />
                        </Box>
                        <Stack p={1} direction="row">
                            <TextField sx={{flexGrow: 1}} label="szerokość geograficzna" name="longitude" />
                            <TextField sx={{flexGrow: 1}} label="długość geograficzna" name="latitude" />
                        </Stack>
                        <Box p={1}>
                            <TextField fullWidth
                                label="Moc fotowoltaiki"
                                name="power"
                                slotProps={unit("kWp")}
                            />
                        </Box>
                        <Button variant="contained" fullWidth type="submit">
                            Oblicz
                        </Button>
                    </Paper>
                </form>
            </main>
        </div>
    );
}
