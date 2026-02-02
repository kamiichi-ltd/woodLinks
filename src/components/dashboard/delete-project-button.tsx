'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteProject } from '@/app/actions/project';
import { useRouter } from 'next/navigation';

interface DeleteProjectButtonProps {
    cardId: string;
    layout?: 'icon' | 'text';
    className?: string;
}

export function DeleteProjectButton({ cardId, layout = 'icon', className = '' }: DeleteProjectButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation if inside a Link
        e.stopPropagation(); // Stop bubbling

        if (!confirm('本当にこのプロジェクト（名刺）を削除しますか？\n\n※この操作は取り消せません。\n※支払い済みの注文がある場合は削除できません。')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteProject(cardId);
            router.refresh();
            if (layout === 'text') {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error(error);
            alert('削除に失敗しました。支払い済みの注文がある可能性があります。');
        } finally {
            setIsDeleting(false);
        }
    };

    if (layout === 'text') {
        return (
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`text-red-500 hover:text-red-700 hover:underline text-sm font-medium flex items-center justify-center gap-2 ${className}`}
            >
                {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Trash2 className="h-4 w-4" />
                )}
                <span>このプロジェクトを削除する</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`
                p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors
                ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            title="プロジェクトを削除"
        >
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </button>
    );
}
