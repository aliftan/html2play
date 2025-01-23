import html2canvas from 'html2canvas';

type ViewportType = 'desktop' | 'mobile';

// Extend Window interface to include our custom functions
declare global {
    interface Window {
        captureFullPage: () => Promise<void>;
        html2canvas: typeof html2canvas;
    }
}

const generateIframeContent = (content: string): string => `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <!-- Phosphor Icons -->
            <script src="https://unpkg.com/@phosphor-icons/web"></script>
            <!-- Import html2canvas -->
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
            <style>
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

                body {
                    line-height: 1.5;
                    color: #111827;
                }

                .content-wrapper {
                    min-height: 100vh;
                    background: white;
                }

                img {
                    max-width: 100%;
                    height: auto;
                }

                /* Icon Styles */
                i.fa, i.fas, i.far, i.fab, i.ph {
                    font-display: block;
                }

                /* Phosphor icons specific styles */
                .ph {
                    display: inline-block;
                    vertical-align: middle;
                }
            </style>
        </head>
        <body>
            <div class="content-wrapper">
                ${content}
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

const generateFullPageHTML = (content: string, viewport: ViewportType): string => {
    const iframeContent = generateIframeContent(content);
    const iframeBlob = new Blob([iframeContent], { type: 'text/html' });
    const iframeUrl = URL.createObjectURL(iframeBlob);

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <!-- Import html2canvas -->
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    html, body {
                        height: 100%;
                        background: #F9FAFB;
                    }

                    .page-container {
                        min-height: 100vh;
                        padding: 16px;
                    }

                    .preview-container {
                        height: calc(100vh - 32px);
                        margin: 0 auto;
                        transition: all 0.3s ease;
                    }

                    .preview-container.mobile {
                        max-width: 430px;
                    }

                    .preview-wrapper {
                        height: 100%;
                        background: white;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 0 0 1px #e5e7eb;
                    }

                    iframe {
                        width: 100%;
                        height: 100%;
                        border: 0;
                    }

                    .floating-controls {
                        position: fixed;
                        bottom: 24px;
                        right: 24px;
                        display: flex;
                        gap: 12px;
                        z-index: 1000;
                    }

                    .control-button {
                        padding: 12px;
                        background: #111827;
                        color: white;
                        border: none;
                        border-radius: 50%;
                        cursor: pointer;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }

                    .control-button:hover {
                        transform: scale(1.05);
                        background: #2c3544;
                    }

                    .control-button.active {
                        background: #4f46e5;
                    }

                    .control-button svg {
                        width: 20px;
                        height: 20px;
                    }

                    .control-tooltip {
                        position: absolute;
                        bottom: 100%;
                        right: 0;
                        margin-bottom: 8px;
                        padding: 4px 8px;
                        background: #111827;
                        color: white;
                        font-size: 12px;
                        border-radius: 4px;
                        white-space: nowrap;
                        opacity: 0;
                        transform: translateY(4px);
                        transition: all 0.2s;
                        pointer-events: none;
                    }

                    .control-button:hover .control-tooltip {
                        opacity: 1;
                        transform: translateY(0);
                    }
                </style>
            </head>
            <body>
                <div class="page-container">
                    <div class="preview-container ${viewport === 'mobile' ? 'mobile' : ''}">
                        <div class="preview-wrapper">
                            <iframe id="preview-iframe" src="${iframeUrl}" sandbox="allow-same-origin allow-scripts"></iframe>
                        </div>
                    </div>
                </div>
                <div class="floating-controls">
                    <button 
                        class="control-button" 
                        onclick="captureFullPage()" 
                        id="screenshot-button"
                    >
                        <span class="control-tooltip">Screenshot</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                    </button>
                    <button 
                        class="control-button ${viewport === 'desktop' ? 'active' : ''}" 
                        onclick="toggleViewport('desktop')"
                        id="desktop-button"
                    >
                        <span class="control-tooltip">Desktop view</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                    </button>
                    <button 
                        class="control-button ${viewport === 'mobile' ? 'active' : ''}" 
                        onclick="toggleViewport('mobile')"
                        id="mobile-button"
                    >
                        <span class="control-tooltip">Mobile view</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                            <line x1="12" y1="18" x2="12" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <script>
                    function toggleViewport(type) {
                        const container = document.querySelector('.preview-container');
                        const desktopBtn = document.getElementById('desktop-button');
                        const mobileBtn = document.getElementById('mobile-button');

                        if (type === 'mobile') {
                            container.classList.add('mobile');
                            mobileBtn.classList.add('active');
                            desktopBtn.classList.remove('active');
                        } else {
                            container.classList.remove('mobile');
                            desktopBtn.classList.add('active');
                            mobileBtn.classList.remove('active');
                        }
                    }

                    async function captureFullPage() {
                        const controls = document.querySelector('.floating-controls');
                        const iframe = document.getElementById('preview-iframe');
                        
                        try {
                            controls.style.display = 'none';
                            
                            // Wait for fonts to load
                            await document.fonts.ready;
                            
                            // Get the screenshot from iframe
                            const dataUrl = await iframe.contentWindow.captureContent();
                            if (!dataUrl) throw new Error('Failed to capture content');

                            // Create and trigger download
                            const link = document.createElement('a');
                            link.download = 'preview.png';
                            link.href = dataUrl;
                            link.click();
                        } catch (error) {
                            console.error('Screenshot failed:', error);
                        } finally {
                            controls.style.display = 'flex';
                        }
                    }

                    window.addEventListener('unload', () => {
                        URL.revokeObjectURL(document.querySelector('iframe').src);
                    });
                </script>
            </body>
        </html>
    `;
};

export const openFullPagePreview = async (code: string, viewport: ViewportType): Promise<void> => {
    const newWindow = window.open('', '_blank');
    if (!newWindow) return;

    const wrappedCode = generateFullPageHTML(code, viewport);
    newWindow.document.write(wrappedCode);
    newWindow.document.close();
};