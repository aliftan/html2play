"use client";

import { useEffect } from 'react';

type HTMLPreviewProps = {
    code: string;
    viewport: 'desktop' | 'mobile';
    onViewportChange: (viewport: 'desktop' | 'mobile') => void;
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export const HTMLPreview = ({ code, viewport, onViewportChange, iframeRef }: HTMLPreviewProps) => {
    useEffect(() => {
        if (!iframeRef.current) return;

        // Create a wrapper around the content with proper styling
        const wrappedCode = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        /* Hide scrollbar by default */
                        ::-webkit-scrollbar {
                            width: 6px;
                            height: 6px;
                            display: none;
                        }
                        
                        /* Show scrollbar on hover */
                        body:hover::-webkit-scrollbar {
                            display: block;
                        }
                        
                        /* Scrollbar styling */
                        ::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        
                        ::-webkit-scrollbar-thumb {
                            background: #a0aec0;
                            border-radius: 3px;
                        }

                        /* Firefox */
                        html {
                            scrollbar-width: none;
                        }
                        
                        body:hover {
                            scrollbar-width: thin;
                        }

                        body {
                            margin: 0;
                            min-height: 100vh;
                        }
                    </style>
                </head>
                <body>
                    ${code}
                </body>
            </html>
        `;

        const blob = new Blob([wrappedCode], { type: 'text/html' });
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
            <div className="flex-1 p-4">
                <div
                    className={`h-full mx-auto bg-white transition-all duration-300
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