import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TextEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (content: Record<string, string>) => void;
    sectionId: string;
    currentContent: Record<string, string>;
    sectionLabel: string;
}

export default function TextEditorModal({
    isOpen,
    onClose,
    onSave,
    sectionId,
    currentContent,
    sectionLabel
}: TextEditorModalProps) {
    const [content, setContent] = useState<Record<string, string>>(currentContent);

    useEffect(() => {
        setContent(currentContent);
    }, [currentContent, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(content);
        onClose();
    };

    const handleFieldChange = (field: string, value: string) => {
        setContent(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#2d2d2d] rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col text-white">
                {/* Header */}
                <div className="p-4 border-b border-black/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">テキスト編集</h3>
                        <p className="text-xs text-gray-400 mt-1">{sectionLabel}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {Object.entries(content).map(([field, value]) => (
                        <div key={field}>
                            <label className="block text-sm font-bold text-gray-300 mb-2 capitalize">
                                {field.replace(/_/g, ' ')}
                            </label>
                            {field.includes('description') || field.includes('content') || value.length > 50 ? (
                                <textarea
                                    value={value}
                                    onChange={(e) => handleFieldChange(field, e.target.value)}
                                    className="w-full bg-[#1C1C1C] border border-gray-700 rounded px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors resize-vertical min-h-[120px]"
                                    rows={5}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleFieldChange(field, e.target.value)}
                                    className="w-full bg-[#1C1C1C] border border-gray-700 rounded px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#252525] border-t border-black/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#88c057] hover:bg-[#7ab04a] text-white rounded text-sm font-bold transition-colors shadow-lg flex items-center gap-2"
                    >
                        <Save size={16} />
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
}
