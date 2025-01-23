"use client";

import { useEffect, useState } from 'react';
import { Download, Copy, Monitor, Smartphone, Check, Maximize2 } from 'lucide-react';
import { openFullPagePreview } from '../utils/fullPagePreview';

// Extend Window interface to include our custom function
declare global {
    interface Window {
        captureContent: () => Promise<string | null>;
    }
}

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
                    <!-- Font Awesome -->
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                    <!-- Phosphor Icons -->
                    <script src="https://unpkg.com/@phosphor-icons/web"></script>
                    <!-- html2canvas for screenshots -->
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
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
                        }

                        body {
                            padding: 0;
                            min-height: auto;
                        }

                        .content-wrapper {
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
                    <script>
                        // Function to capture content
                        async function captureContent() {
                            try {
                                const content = document.querySelector('.content-wrapper');
                                if (!content) return null;

                                const canvas = await html2canvas(content, {
                                    scale: window.devicePixelRatio * 2,
                                    useCORS: true,
                                    allowTaint: true,
                                    backgroundColor: '#ffffff',
                                    logging: false,
                                    width: content.scrollWidth,
                                    height: content.scrollHeight,
                                    windowWidth: content.scrollWidth,
                                    windowHeight: content.scrollHeight,
                                    onclone: (clonedDoc) => {
                                        const style = clonedDoc.createElement('style');
                                        style.textContent = \`
                                            i.fa, i.fas, i.far, i.fab {
                                                font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands" !important;
                                            }
                                            .ph {
                                                font-family: "Phosphor" !important;
                                            }
                                        \`;
                                        clonedDoc.head.appendChild(style);
                                    }
                                });
                                return canvas.toDataURL('image/png', 1.0);
                            } catch (error) {
                                console.error('Failed to capture content:', error);
                                return null;
                            }
                        }

                        window.captureContent = captureContent;
                    </script>
                </body>
            </html>
        `;

        const blob = new Blob([wrappedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        iframeRef.current.src = url;

        return () => URL.revokeObjectURL(url);
    }, [code, iframeRef]);

    const handleFullPage = () => openFullPagePreview(code, viewport);

    const handleSave = async () => {
        if (!iframeRef.current || capturing) return;

        try {
            setCapturing(true);
            const iframe = iframeRef.current;

            // Wait for fonts to load
            await document.fonts.ready;

            // Get the screenshot from iframe
            const dataUrl = await iframe.contentWindow?.captureContent();
            if (!dataUrl) throw new Error('Failed to capture content');

            // Create and trigger download
            const link = document.createElement('a');
            link.download = 'preview.png';
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to save preview:', error);
        } finally {
            setCapturing(false);
        }
    };

    const handleCopyImage = async () => {
        if (!iframeRef.current || capturing) return;

        try {
            setCapturing(true);
            const iframe = iframeRef.current;

            // Get the screenshot from iframe
            const dataUrl = await iframe.contentWindow?.captureContent();
            if (!dataUrl) return;

            // Convert data URL to blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            setShowCopyTooltip(true);
        } catch (error) {
            console.error('Failed to copy image:', error);
        } finally {
            setCapturing(false);
        }
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

    return (
        <div className="flex-1 border border-gray-200 rounded-lg flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                <span className="text-sm text-gray-600">Preview</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleFullPage}
                        className="px-3 py-1 text-sm rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Maximize2 size={14} className="shrink-0" />
                        Full Page
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={capturing}
                        className="px-3 py-1 text-sm rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download size={14} className="shrink-0" />
                        Save
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