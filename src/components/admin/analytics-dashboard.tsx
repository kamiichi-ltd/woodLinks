'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card' // Assuming we have these or standard divs
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Eye, MousePointerClick, UserPlus, TrendingUp } from 'lucide-react'

type AnalyticsData = {
    totalViews: number
    todayViews: number
    totalSaves: number
    clickRate: string
    dailyViews: { date: string; views: number }[]
    deviceRatio: { name: string; value: number; fill: string }[]
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData | null }) {
    if (!data) return <div className="p-4 text-center text-stone-400">データがありません</div>

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-700 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                アクセス解析
            </h3>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-stone-500 font-medium">総閲覧数</span>
                        <Eye className="w-4 h-4 text-stone-400" />
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{data.totalViews.toLocaleString()}</div>
                    <div className="text-xs text-stone-400 mt-1">Today: {data.todayViews}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-stone-500 font-medium">保存数</span>
                        <UserPlus className="w-4 h-4 text-stone-400" />
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{data.totalSaves.toLocaleString()}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-stone-500 font-medium">クリック率</span>
                        <MousePointerClick className="w-4 h-4 text-stone-400" />
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{data.clickRate}%</div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bar Chart: Daily Views */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                    <h4 className="text-sm font-bold text-stone-600 mb-6">直近7日間の閲覧数</h4>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.dailyViews}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#78716c', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#78716c', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f5f5f4' }}
                                />
                                <Bar
                                    dataKey="views"
                                    fill="#57534e"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Device Ratio */}
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                    <h4 className="text-sm font-bold text-stone-600 mb-6">デバイス比率</h4>
                    <div className="h-[250px] w-full flex justify-center items-center">
                        {data.deviceRatio.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.deviceRatio}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.deviceRatio.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-stone-300 text-sm">データなし</div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-stone-500 mt-2">
                        {data.deviceRatio.map(item => (
                            <div key={item.name} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }}></div>
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
