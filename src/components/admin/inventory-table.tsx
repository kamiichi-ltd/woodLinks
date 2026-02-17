'use client'

import React, { useState } from 'react'
import { Database } from '@/database.types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, FileEdit, Trash2, QrCode, ExternalLink, Filter } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { deleteWood } from '@/app/admin/inventory/actions'
import QRCodeModal from './qr-code-modal'

type WoodInventory = Database['public']['Tables']['wood_inventory']['Row']

interface InventoryTableProps {
    initialData: WoodInventory[]
    initialStatus?: string
}

export default function InventoryTable({ initialData, initialStatus }: InventoryTableProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState(initialStatus || 'all')
    const [isDeleting, setIsDeleting] = useState(false)
    const [qrModalOpen, setQrModalOpen] = useState(false)
    const [selectedWoodForQr, setSelectedWoodForQr] = useState<WoodInventory | null>(null)

    // Client-side filtering for search term (Status is handled server-side ideally, but for small datasets client side is fine/faster)
    // Actually, task said server-side filtering for status. But checking page.tsx, it passes initialData.
    // Let's implement client-side search and status filter for interactivity without reload for now, 
    // or reload on status change. Let's do client-side for immediate feedback as list won't be huge yet.

    const filteredData = initialData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.species.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || item.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const handleDelete = async (id: string) => {
        if (!confirm('本当にこの木材を削除しますか？この操作は取り消せません。')) return

        setIsDeleting(true)
        try {
            await deleteWood(id)
            router.refresh()
        } catch (error) {
            alert('削除に失敗しました')
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    const openQrModal = (wood: WoodInventory) => {
        setSelectedWoodForQr(wood)
        setQrModalOpen(true)
    }

    return (
        <div className="space-y-4">
            <QRCodeModal
                isOpen={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                wood={selectedWoodForQr}
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="名前や樹種で検索..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="ステータス" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全てのステータス</SelectItem>
                            <SelectItem value="available">販売中 (Available)</SelectItem>
                            <SelectItem value="reserved">商談中 (Reserved)</SelectItem>
                            <SelectItem value="sold">売約済 (Sold)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[80px]">画像</TableHead>
                            <TableHead>名前 / 樹種</TableHead>
                            <TableHead className="hidden md:table-cell">寸法</TableHead>
                            <TableHead>価格</TableHead>
                            <TableHead>閲覧数</TableHead>
                            <TableHead className="hidden sm:table-cell">ステータス</TableHead>
                            <TableHead className="text-right">アクション</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    該当する木材が見つかりません
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((wood) => (
                                <TableRow key={wood.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden relative">
                                            {wood.images && wood.images[0] ? (
                                                <Image
                                                    src={wood.images[0]}
                                                    alt={wood.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                    No Img
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{wood.name}</div>
                                        <div className="text-sm text-gray-500">{wood.species}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                                        {/* @ts-ignore: dims might be json */}
                                        {wood.dimensions?.length} x {wood.dimensions?.width} x {wood.dimensions?.thickness} mm
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-gray-900">
                                            ¥{wood.price.toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-mono text-gray-600">
                                            {wood.views?.toLocaleString() ?? 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge variant={wood.status === 'available' ? 'default' : wood.status === 'sold' ? 'destructive' : 'secondary'}>
                                            {wood.status === 'available' ? '販売中' : wood.status === 'reserved' ? '商談中' : '売約済'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/admin/inventory/${wood.id}`)}>
                                                    <FileEdit className="mr-2 h-4 w-4" />
                                                    編集する
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openQrModal(wood)}>
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    QRコードを表示
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`/wood/${wood.nfc_slug}`, '_blank')}>
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    公開ページを確認
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    onClick={() => handleDelete(wood.id)}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    削除する
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-xs text-gray-500 text-right">
                {filteredData.length} 件の木材を表示中
            </div>
        </div>
    )
}
