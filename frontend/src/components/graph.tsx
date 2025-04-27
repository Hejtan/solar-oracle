"use client";
import { Paper, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts";

// function getDaysInYear(year: number) {
//     const days = [];
//     const date = new Date(year, 0, 1); // January 1st of the year
  
//     while (date.getFullYear() === year) {
//       days.push(new Date(date)); // Add a copy of the date
//       date.setDate(date.getDate() + 1); // Move to the next day
//     }
  
//     return days;
//   }

  function getHoursInMonth(year: number, month: number) {
    const hours = [];
    const date = new Date(year, month, 1, 0, 0, 0); // Start at first day of month, midnight
  
    while (date.getFullYear() === year && date.getMonth() === month) {
      hours.push(new Date(date)); // Add a copy
      date.setHours(date.getHours() + 1); // Move forward one hour
    }
  
    return hours;
  }

interface Props {
    color: string;
    data: number[];
    year: number;
    month: number;
    label: string;
    unit: string;
}
export const Graph: React.FC<Props> = ({ color, data, year, month, label, unit }) => {
    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6">{label}</Typography>
            <LineChart
                xAxis={[{ data: getHoursInMonth(year, month).concat(getHoursInMonth(year, month+1)), scaleType: 'time',
                    min: new Date(year, month, 1),
                    max: new Date(year, month + 1),
                    valueFormatter: (date: Date) => date.getDate() + "-" + date.getMonth() }]}
                yAxis={[{label: `${label} (${unit})`}]}
                series={[
                    {
                        label: label,
                        color,
                        area: true,
                        data: data,
                        valueFormatter: (val) => `${val}${unit}`,
                    },
                ]}
                height={300}
                slotProps={{
                    legend: {
                        position: { vertical: "bottom", horizontal: "center" },
                    },
                }}
            />
        </Paper>
    );
};
