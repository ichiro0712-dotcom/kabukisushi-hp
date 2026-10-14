import React, { useEffect, useState, useRef } from 'react';
import { X, CloudUpload, Loader2 } from 'lucide-react';
import { uploadImage } from '../../../../lib/storageService';

interface ImageAssetLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    mediaType?: 'image' | 'video';
    storeId?: string;
    category?: string;
}

/** 長い辺をこの大きさまで縮める。メニューの写真は小さい正方形で出すので十分 */
const MAX_IMAGE_EDGE = 1600;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB（縮める前の元ファイル）
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

/** iPhone の写真形式。Chrome・Android・Windows では表示できないので受け付けない */
const isHeic = (file: File) => /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);

/**
 * 写真を縮めて WebP にする。
 * 以前は原寸（数MB）のまま公開していたため、ページが重く、Supabase の転送量も増えていた
 * （2026-07 の停止は転送量の上限超過が原因）。GIF は動きが消えるのでそのまま。
 */
async function shrinkImage(file: File): Promise<File> {
    if (file.type === 'image/gif') return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas が使えません');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.85));
    if (!blob) throw new Error('画像の変換に失敗しました');
    // すでに小さい写真は、変換して逆に大きくなるなら元のまま
    if (scale === 1 && blob.size >= file.size && file.type !== 'image/png') return file;
    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${base}.webp`, { type: 'image/webp' });
}

/**
 * 画像・動画を選ぶ画面。
 *
 * 以前は他社サービスの見本画面をそのまま使っていて、「アップロードされた画像」は過去の写真ではなく
 * 無関係な素材写真、「URLから取り込む」や削除ボタンは押しても何も起きなかった。実際に使える
 * 「アップロード」だけを残している。
 */
export default function ImageAssetLibrary({ isOpen, onClose, onSelect, mediaType = 'image', storeId = 'general', category = 'uploads' }: ImageAssetLibraryProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    /** 開く・閉じるたびに増やす番号。閉じた後・開き直した後に届いたアップロード結果は使わない */
    const openSeqRef = useRef(0);
    useEffect(() => { openSeqRef.current += 1; }, [isOpen]);

    const isVideo = mediaType === 'video';
    const label = isVideo ? '動画' : '画像';

    if (!isOpen) return null;

    const handleUploadFile = async (file: File) => {
        setUploadError(null);
        const seq = openSeqRef.current;

        if (!isVideo && isHeic(file)) {
            setUploadError('iPhoneの写真形式（HEIC）は使えません。写真アプリで「書き出す」→ JPEG にしてから選んでください。');
            return;
        }
        const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
        if (!allowed.includes(file.type)) {
            setUploadError(isVideo ? '使える形式は mp4・webm・ogg です。' : '使える形式は JPEG・PNG・WebP・GIF です。');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setUploadError('ファイルサイズが大きすぎます（最大10MB）');
            return;
        }

        setIsUploading(true);
        try {
            const toUpload = isVideo ? file : await shrinkImage(file);
            const publicUrl = await uploadImage(toUpload, storeId, category);
            // 待っている間に画面を閉じた・開き直した場合は使わない（別の品や別の店に入るのを防ぐ）
            if (seq !== openSeqRef.current) return;
            if (publicUrl) {
                onSelect(publicUrl);
                return;
            }
            setUploadError('画像のアップロードに失敗しました。通信状況を確認して、もう一度お試しください。');
        } catch (err) {
            console.error('Image upload error:', err);
            if (seq === openSeqRef.current) setUploadError('画像を読み込めませんでした。JPEG・PNG で保存し直してからお試しください。');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) await handleUploadFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) await handleUploadFile(file);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-[720px] max-w-[95vw] rounded-lg shadow-2xl flex flex-col relative overflow-hidden border border-gray-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    title="閉じる"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
                    <CloudUpload size={22} className="text-blue-500" />
                    <span className="text-sm font-bold text-gray-900">新しい{label}をアップロード</span>
                </div>

                <div className="flex flex-col items-center justify-center p-10 bg-[#fcfcfc]">
                    <div
                        className="w-full border-2 border-dashed border-gray-200 rounded-xl bg-white p-12 flex flex-col items-center text-center shadow-sm"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {uploadError && (
                            <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm font-bold">
                                {uploadError}
                            </div>
                        )}
                        {isUploading ? (
                            <>
                                <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
                                <div className="text-xl font-bold text-gray-800 mb-2">アップロード中...</div>
                                <div className="text-xs text-gray-400">終わるまでこの画面を閉じないでください</div>
                            </>
                        ) : (
                            <>
                                <div className="text-xl font-bold text-gray-800 mb-2">ファイルをここへドラッグしてください</div>
                                <div className="text-gray-400 mb-6 font-medium">もしくは</div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-10 py-3 bg-[#88c057] hover:bg-[#7ab04a] text-white rounded-md font-bold text-sm shadow-lg transition-all mb-6"
                                >
                                    参照
                                </button>
                            </>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept={isVideo ? VIDEO_TYPES.join(',') : IMAGE_TYPES.join(',')}
                        />
                        <div className="text-[11px] text-gray-400 leading-relaxed">
                            {isVideo
                                ? '対応している形式：mp4・webm・ogg（10MBまで）'
                                : '対応している形式：JPEG・PNG・WebP・GIF（10MBまで）。写真は自動で縮めてから公開します。iPhoneの HEIC は JPEG にしてから選んでください。'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
