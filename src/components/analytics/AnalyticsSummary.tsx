'use client'

import { Eye, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AnalyticsSummary({ totalViews, totalSaves }: { totalViews: number, totalSaves: number }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl p-6 border border-[#e6e2d3] shadow-sm relative overflow-hidden"
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-[#f4f1ea] rounded-full text-[#3d3126]">
                        <Eye className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-[#8c7b6c] tracking-widest uppercase">直近30日の閲覧数</span>
                </div>
                <div className="relative z-10 flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-bold text-[#2c3e50]">{totalViews}</span>
                    <span className="text-sm font-bold text-[#8c7b6c]">回</span>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5">
                    <Eye className="h-24 w-24 text-[#2c3e50]" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-3xl p-6 border border-[#e6e2d3] shadow-sm relative overflow-hidden"
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-[#ecf4ff] rounded-full text-[#4a90e2]">
                        <UserCheck className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-[#8c7b6c] tracking-widest uppercase">連絡先の保存回数</span>
                </div>
                <div className="relative z-10 flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-bold text-[#2c3e50]">{totalSaves}</span>
                    <span className="text-sm font-bold text-[#8c7b6c]">回</span>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5">
                    <UserCheck className="h-24 w-24 text-[#4a90e2]" />
                </div>
            </motion.div>
        </div>
    )
}
