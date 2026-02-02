'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { DailyViews } from '@/services/analytics-service'

export default function AnalyticsChart({ data }: { data: DailyViews[] }) {
    return (
        <div className="w-full h-full flex flex-col">
            <div className="mb-2 flex justify-between items-center">
                <h4 className="font-bold text-[#8c7b6c] text-xs tracking-widest uppercase">閲覧数の推移</h4>
                <div className="text-[10px] bg-[#f4f1ea] px-2 py-1 rounded-full text-[#8c7b6c]">過去30日間</div>
            </div>

            <div className="flex-1 w-full relative min-h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 0,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d4a373" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#d4a373" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe0" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10, fill: '#8c7b6c' }}
                            interval={6}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10, fill: '#8c7b6c' }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            formatter={(value: any) => [value, '閲覧数']}
                            contentStyle={{
                                backgroundColor: '#2c3e50',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fdfbf7',
                                fontSize: '12px'
                            }}
                            itemStyle={{ color: '#fdfbf7' }}
                            labelStyle={{ color: '#8c7b6c', marginBottom: '4px' }}
                            cursor={{ stroke: '#d4a373', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="views"
                            stroke="#d4a373"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorViews)"
                            activeDot={{ r: 6, fill: "#2c3e50", stroke: "#fff", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
