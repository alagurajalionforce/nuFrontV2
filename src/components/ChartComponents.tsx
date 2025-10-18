import React from 'react';

interface BarData {
    name: string;
    value: number;
}

export function BarChart({ data, colors }: { data: BarData[]; colors: string[] }) {
    const maxValue = Math.max(...data.map(item => item.value), 0) || 1;
    const minHeight = 100; // Minimum height in percentage

    return (
        <div className="h-64 w-full flex flex-col">
            {/* Chart Bars */}
            <div className="flex items-end h-full gap-4 px-4">
                {data.map((item, index) => {
                    // Calculate height ensuring minimum visibility
                    const calculatedHeight = (item.value / maxValue) * 100;
                    const height = Math.max(calculatedHeight, minHeight);
                    //console.log(height)
                    return (
                        <div key={item.name} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full rounded-t-md transition-all duration-300"
                                style={{
                                    height: `${height}%`,
                                    backgroundColor: colors[index % colors.length],
                                }}
                            ></div>
                            <p className="text-xs mt-2 text-gray-500">{item.name}</p>
                            <p className="text-sm font-medium">
                                {item.value.toLocaleString()}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* X-axis line */}
            <div className="border-t border-gray-200 mt-2"></div>
        </div>
    );
}

export function PieChart({ data, colors }: { data: { name: string; value: number }[]; colors: string[] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;

    return (
        <div className="h-64 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {data.map((item, index) => {
                    const percent = (item.value / total) * 100;
                    const startX = 50 + 50 * Math.cos(2 * Math.PI * cumulativePercent / 100);
                    const startY = 50 + 50 * Math.sin(2 * Math.PI * cumulativePercent / 100);
                    cumulativePercent += percent;
                    const endX = 50 + 50 * Math.cos(2 * Math.PI * cumulativePercent / 100);
                    const endY = 50 + 50 * Math.sin(2 * Math.PI * cumulativePercent / 100);

                    const largeArcFlag = percent > 50 ? 1 : 0;

                    return (
                        <path
                            key={item.name}
                            d={`M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                            fill={colors[index % colors.length]}
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-bold">{total.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total</p>
                </div>
            </div>
        </div>
    );
}

export function LineChart({ data }: { data: { name: string; data: number[] }[] }) {
    const maxValue = Math.max(...data.flatMap(series => series.data), 0) || 1;
    const minValue = Math.min(...data.flatMap(series => series.data), 0);
    const range = maxValue - minValue;

    return (
        <div className="h-64">
            <div className="flex h-full">
                <div className="flex-1 relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between">
                        {[maxValue, maxValue / 2, minValue].map((value, i) => (
                            <div key={i} className="text-xs text-gray-500">
                                {Math.round(value).toLocaleString()}
                            </div>
                        ))}
                    </div>

                    {/* Chart area */}
                    <div className="ml-8 h-full">
                        {data.map((series, seriesIndex) => (
                            <div key={series.name} className="absolute top-0 left-0 right-0 bottom-0">
                                {series.data.map((value, dataIndex) => {
                                    const x = (dataIndex / (series.data.length - 1)) * 100;
                                    const y = 100 - ((value - minValue) / range) * 100;

                                    return (
                                        <React.Fragment key={dataIndex}>
                                            <div
                                                className="absolute w-2 h-2 rounded-full"
                                                style={{
                                                    left: `${x}%`,
                                                    top: `${y}%`,
                                                    backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'][seriesIndex % 4],
                                                    transform: 'translate(-50%, -50%)',
                                                }}
                                            />
                                            {dataIndex > 0 && (
                                                <div
                                                    className="absolute top-0 left-0 w-full h-full"
                                                    style={{
                                                        background: `linear-gradient(to right, 
                              transparent ${(x - 100 / (series.data.length - 1))}%, 
                              ${['#3b82f6', '#ef4444', '#10b981', '#f59e0b'][seriesIndex % 4]} ${x}%)`,
                                                        clipPath: `polygon(
                              ${(x - 100 / (series.data.length - 1))}% ${100 - ((series.data[dataIndex - 1] - minValue) / range) * 100}%,
                              ${x}% ${y}%,
                              ${x}% 100%,
                              ${(x - 100 / (series.data.length - 1))}% 100%
                            )`,
                                                        opacity: 0.2,
                                                    }}
                                                />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={i}>{day}</div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {data.map((series, i) => (
                    <div key={series.name} className="flex items-center">
                        <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'][i % 4] }}
                        />
                        <span className="text-sm">{series.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}