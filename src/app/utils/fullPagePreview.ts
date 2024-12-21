type ViewportType = 'desktop' | 'mobile';

interface PreviewStyles {
    readonly content: string;
    readonly viewport: ViewportType;
}

const generateIframeContent = (content: string): string => `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                    background: white;
                }

                .content-wrapper {
                    padding: 16px;
                }

                img {
                    max-width: 100%;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <div class="content-wrapper">
                ${content}
            </div>
        </body>
    </html>
`;

const generateFullPageHTML = ({ content, viewport }: PreviewStyles): string => {
    const iframeContent = generateIframeContent(content);
    const iframeBlob = new Blob([iframeContent], { type: 'text/html' });
    const iframeUrl = URL.createObjectURL(iframeBlob);

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                            <iframe src="${iframeUrl}" sandbox="allow-same-origin"></iframe>
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
                        try {
                            const controls = document.querySelector('.floating-controls');
                            controls.style.display = 'none';
                            
                            const iframe = document.querySelector('iframe');
                            const iframeDoc = iframe.contentDocument;
                            const contentBody = iframeDoc.body;

                            const canvas = await html2canvas(contentBody, {
                                allowTaint: true,
                                useCORS: true,
                                backgroundColor: '#fff',
                                scale: window.devicePixelRatio * 2,
                                logging: false,
                                windowWidth: contentBody.scrollWidth,
                                windowHeight: contentBody.scrollHeight,
                                width: contentBody.scrollWidth,
                                height: contentBody.scrollHeight,
                            });

                            controls.style.display = 'flex';
                            
                            const link = document.createElement('a');
                            link.download = 'preview.png';
                            link.href = canvas.toDataURL('image/png', 1.0);
                            link.click();
                        } catch (error) {
                            console.error('Failed to capture screenshot:', error);
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

export const openFullPagePreview = (code: string, viewport: ViewportType): void => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        const wrappedCode = generateFullPageHTML({ content: code, viewport });
        newWindow.document.write(wrappedCode);
        newWindow.document.close();
    }
};