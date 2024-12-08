import { useEffect } from 'react';

interface HTMLPreviewProps {
    code: string;
    viewport: 'desktop' | 'mobile';
    onViewportChange: (viewport: 'desktop' | 'mobile') => void;
    iframeRef: React.RefObject<HTMLIFrameElement | null>; // Updated type
}

export const HTMLPreview = ({ code, viewport, onViewportChange, iframeRef }: HTMLPreviewProps) => {
    useEffect(() => {
        if (!iframeRef.current) return;

        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        iframeRef.current.src = url;

        return () => URL.revokeObjectURL(url);
    }, [code, iframeRef]);

    return (
        <div className="flex-1 border border-gray-200 rounded-lg flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                <span className="text-sm text-gray-600">Preview</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => onViewportChange('desktop')}
                        className={`px-3 py-1 text-sm rounded-md ${viewport === 'desktop'
                            ? 'bg-gray-900 text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        Desktop
                    </button>
                    <button
                        onClick={() => onViewportChange('mobile')}
                        className={`px-3 py-1 text-sm rounded-md ${viewport === 'mobile'
                            ? 'bg-gray-900 text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        Mobile
                    </button>
                </div>
            </div>
            <div className="p-4 flex-1 overflow-auto">
                <div
                    className={`h-full mx-auto bg-white transition-all duration-300 relative
                        ${viewport === 'mobile' ? 'max-w-[430px]' : 'w-full'}
                        ${viewport === 'mobile' ? 'shadow-[0_0_0_1px_#e5e7eb]' : ''}
                        ${viewport === 'mobile' ? 'rounded-lg' : ''}`}
                >
                    <iframe
                        ref={iframeRef}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                        title="Preview"
                    />
                </div>
            </div>
        </div>
    );
};