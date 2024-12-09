"use client";

import { useEffect, useState } from 'react';
import { Download, Copy, Monitor, Smartphone, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

type HTMLPreviewProps = {
    code: string;
    viewport: 'desktop' | 'mobile';
    onViewportChange: (viewport: 'desktop' | 'mobile') => void;
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export const HTMLPreview = ({ code, viewport, onViewportChange, iframeRef }: HTMLPreviewProps) => {
    const [capturing, setCapturing] = useState(false);
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);

    useEffect(() => {
        if (!iframeRef.current) return;

        // Include font imports and enhanced styling
        const wrappedCode = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        /* Reset and base styles */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        html {
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        }

                        /* Scrollbar styling */
                        ::-webkit-scrollbar {
                            width: 6px;
                            height: 6px;
                            display: none;
                        }
                        
                        body:hover::-webkit-scrollbar {
                            display: block;
                        }
                        
                        ::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        
                        ::-webkit-scrollbar-thumb {
                            background: #a0aec0;
                            border-radius: 3px;
                        }

                        html {
                            scrollbar-width: none;
                        }
                        
                        body:hover {
                            scrollbar-width: thin;
                        }

                        html, body {
                            width: 100%;
                            line-height: 1.5;
                            color: #111827;
                            background: #F3F4F6;
                        }

                        body {
                            padding: 0; // Remove padding from body
                            min-height: auto; // Let content determine height
                        }

                        // Add a container for the content
                        .content-wrapper {
                            padding: 16px;
                            background: white;
                        }

                        img {
                            image-rendering: -webkit-optimize-contrast;
                            image-rendering: crisp-edges;
                        }
                    </style>
                </head>
                <body>
                    <div class="content-wrapper">
                        ${code}
                    </div>
                </body>
            </html>
        `;

        const blob = new Blob([wrappedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        iframeRef.current.src = url;

        return () => URL.revokeObjectURL(url);
    }, [code, iframeRef]);

    const capturePreview = async () => {
        if (!iframeRef.current || capturing) return;

        try {
            setCapturing(true);
            const iframe = iframeRef.current;
            const iframeDocument = iframe.contentDocument;

            if (!iframeDocument) return null;

            // Wait for fonts to load
            await document.fonts.ready;

            await Promise.all([
                ...Array.from(iframeDocument.images)
                    .map(img => img.complete ? Promise.resolve() : new Promise(resolve => img.onload = resolve)),
                new Promise(resolve => setTimeout(resolve, 200))
            ]);

            const canvas = await html2canvas(iframeDocument.body, {
                allowTaint: true,
                useCORS: true,
                backgroundColor: '#F3F4F6',
                scale: window.devicePixelRatio * 2,
                logging: false,
                width: iframe.clientWidth,
                height: iframeDocument.documentElement.offsetHeight,
                windowWidth: iframe.clientWidth,
                windowHeight: iframeDocument.documentElement.offsetHeight,
                foreignObjectRendering: true,
                removeContainer: true,
                scrollY: 0,
                scrollX: 0,

                onclone: (clonedDoc) => {
                    const style = clonedDoc.createElement('style');
                    style.textContent = `
                        * {
                            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                            -webkit-font-smoothing: antialiased !important;
                            -moz-osx-font-smoothing: grayscale !important;
                            font-weight: normal; // Add default font weight
                        }

                        strong, b, .font-medium {
                            font-weight: 500 !important;
                        }

                        .font-semibold {
                            font-weight: 600 !important;
                        }
                        
                        /* Card Styles */
                        .card {
                            background: white;
                            border-radius: 0.5rem;
                            padding: 1rem;
                            margin-bottom: 1rem;
                        }
                        
                        /* Text Styles */
                        .title {
                            font-size: 1.125rem;
                            font-weight: 600;
                            color: #111827;
                            margin-bottom: 0.25rem;
                        }
                        
                        .subtitle {
                            font-size: 0.875rem;
                            color: #6B7280;
                        }
                        
                        /* Points and Balance */
                        .points {
                            color: #22C55E;
                            font-weight: 600;
                        }
                        
                        .balance {
                            color: #111827;
                            font-weight: 600;
                        }
                        
                        /* Buttons */
                        .button {
                            background: #3B82F6;
                            color: white;
                            padding: 0.75rem 1rem;
                            border-radius: 0.375rem;
                            font-weight: 500;
                            text-align: center;
                        }
                        
                        .button-secondary {
                            background: #EF4444;
                            color: white;
                        }
    
                        /* Version Badge */
                        .version {
                            background: #EFF6FF;
                            color: #3B82F6;
                            padding: 0.25rem 0.5rem;
                            border-radius: 0.25rem;
                            font-size: 0.875rem;
                        }
    
                        /* List Items */
                        .list-item {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            margin: 0.5rem 0;
                            color: #374151;
                        }
                    `;
                    clonedDoc.head.appendChild(style);
                }
            });

            return canvas;
        } catch (error) {
            console.error('Failed to capture preview:', error);
            return null;
        } finally {
            setCapturing(false);
        }
    };

    const handleDownloadJpeg = async () => {
        const canvas = await capturePreview();
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'preview.jpeg';
        // Use maximum quality for JPEG
        link.href = canvas.toDataURL('image/jpeg', 1.0);
        link.click();
    };

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (showCopyTooltip) {
            timeoutId = setTimeout(() => {
                setShowCopyTooltip(false);
            }, 1000);
        }
        return () => clearTimeout(timeoutId);
    }, [showCopyTooltip]);

    const handleCopyImage = async () => {
        const canvas = await capturePreview();
        if (!canvas) return;

        try {
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
            });
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            setShowCopyTooltip(true);
        } catch (error) {
            console.error('Failed to copy image:', error);
        }
    };

    return (
        <div className="flex-1 border border-gray-200 rounded-lg flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                <span className="text-sm text-gray-600">Preview</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadJpeg}
                        disabled={capturing}
                        className="px-3 py-1 text-sm rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download size={14} className="shrink-0" />
                        Download
                    </button>
                    <div className="relative">
                        <button
                            onClick={handleCopyImage}
                            disabled={capturing}
                            className="px-3 py-1 text-sm rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                        >
                            {showCopyTooltip ? (
                                <Check size={14} className="shrink-0 text-green-500" />
                            ) : (
                                <Copy size={14} className="shrink-0" />
                            )}
                            Copy
                        </button>
                        <div
                            className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-sm whitespace-nowrap transition-opacity duration-150 ${showCopyTooltip ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                        >
                            Copied to clipboard!
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                    </div>
                    <button
                        onClick={() => onViewportChange('desktop')}
                        className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${viewport === 'desktop'
                            ? 'bg-gray-900 text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Monitor size={14} className="shrink-0" />
                        Desktop
                    </button>
                    <button
                        onClick={() => onViewportChange('mobile')}
                        className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${viewport === 'mobile'
                            ? 'bg-gray-900 text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Smartphone size={14} className="shrink-0" />
                        Mobile
                    </button>
                </div>
            </div>
            <div className="flex-1 p-4 bg-gray-50">
                <div
                    className={`h-full mx-auto bg-white transition-all duration-300
                        ${viewport === 'mobile' ? 'max-w-[430px]' : 'w-full'}
                        ${viewport === 'mobile' ? 'shadow-[0_0_0_1px_#e5e7eb]' : ''}
                        ${viewport === 'mobile' ? 'rounded-lg' : ''}`}
                >
                    <iframe
                        ref={iframeRef}
                        className="w-full h-full border-0 overflow-hidden"
                        sandbox="allow-scripts allow-same-origin"
                        title="Preview"
                    />
                </div>
            </div>
        </div>
    );
};