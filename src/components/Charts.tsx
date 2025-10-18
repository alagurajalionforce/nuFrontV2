import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    TooltipItem
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface ChartData {
    name: string;
    value: number;
}

interface LineChartData {
    name: string;
    data: number[];
}

export function BarChart({ data, colors }: { data: ChartData[]; colors: string[] }) {
    const chartData = {
        labels: data.map(item => item.name),
        datasets: [
            {
                label: 'NGN',
                data: data.map(item => item.value),
                backgroundColor: colors,
                borderColor: colors.map(color => `${color}99`),
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<'bar'>) => {
                        return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: any) => value.toLocaleString()
                }
            }
        }
    };

    return (
        <div className="h-64 w-full">
            <Bar data={chartData} options={options} />
        </div>
    );
}

export function PieChart({ data, colors }: { data: ChartData[]; colors: string[] }) {
    const chartData = {
        labels: data.map(item => item.name),
        datasets: [
            {
                data: data.map(item => item.value),
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<'pie'>) => {
                        const label = context.label || '';
                        const value = context.raw as number || 0;
                        // const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
                        // const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value.toLocaleString()}`;
                    }
                }
            }
        },
    };

    return (
        <div className="h-64 w-full">
            <Pie data={chartData} options={options} />
        </div>
    );
}

export function LineChart({ data }: { data: LineChartData[] }) {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    // Hardcoded labels for a week. Consider making this a prop for more flexibility.
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const chartData = {
        labels,
        datasets: data.map((item, index) => ({
            label: item.name,
            data: item.data,
            borderColor: colors[index % colors.length],
            backgroundColor: `${colors[index % colors.length]}20`,
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
        })),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<'line'>) => {
                        return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                    }
                }
            },
            legend: {
                position: 'bottom' as const,
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: (value: any) => value.toLocaleString()
                }
            }
        }
    };

    return (
        <div className="h-80 w-full">
            <Line data={chartData} options={options} />
        </div>
    );
}