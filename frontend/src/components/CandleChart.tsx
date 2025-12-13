import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface ChartProps {
    data: { time: any; open: number; high: number; low: number; close: number }[];
}

export const CandleChart: React.FC<ChartProps> = ({ data }) => {

    // Helper: Calculate Simple Moving Average (SMA)
    const calculateSMA = (data: ChartProps['data'], period: number) => {
        return data.map((d, index) => {
            if (index < period - 1) return { x: new Date(d.time * 1000), y: null };

            const slice = data.slice(index - period + 1, index + 1);
            const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
            return {
                x: new Date(d.time * 1000),
                y: sum / period
            };
        });
    };

    const series = React.useMemo(() => {
        const candleSeries = {
            name: 'Price',
            type: 'candlestick',
            data: data.map(d => ({
                x: new Date(d.time * 1000),
                y: [d.open, d.high, d.low, d.close]
            }))
        };

        const smaSeries = {
            name: 'SMA-5',
            type: 'line',
            data: calculateSMA(data, 5)
        };

        return [candleSeries, smaSeries];
    }, [data]);

    const options: ApexOptions = {
        chart: {
            type: 'candlestick',
            height: 350,
            background: 'transparent',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                },
            },
            animations: { enabled: false }
        },
        theme: { mode: 'dark' },
        stroke: {
            width: [1, 2], // 1px for candle border, 2px for SMA line
            curve: 'smooth'
        },
        colors: ['#4ade80', '#8b5cf6'], // Candle Up Color (overridden by plotOptions), SMA Color (Purple)
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#4ade80',
                    downward: '#ef4444'
                },
                wick: { useFillColor: true }
            }
        },
        grid: {
            borderColor: '#333',
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            type: 'datetime',
            tooltip: { enabled: true },
            labels: {
                style: {
                    colors: '#9ca3af'
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            tooltip: { enabled: true },
            labels: {
                style: {
                    colors: '#9ca3af'
                },
                formatter: (val) => val ? val.toFixed(2) : ''
            }
        },
        tooltip: {
            theme: 'dark',
            shared: true,
            intersect: false, // Show all series for the x-axis
            x: { format: 'dd MMM HH:mm' },
            style: {
                fontSize: '12px',
                fontFamily: 'monospace'
            }
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'left',
        }
    };

    return (
        <div className="w-full h-full">
            <Chart options={options} series={series} height="100%" width="100%" />
        </div>
    );
};
