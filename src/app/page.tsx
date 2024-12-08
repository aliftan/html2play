"use client";

import { useState, useRef, useEffect } from 'react';
import { Github } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';

export default function Home() {
  const [htmlCode, setHtmlCode] = useState('');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync scroll positions
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement | HTMLPreElement>) => {
    const { scrollTop } = e.currentTarget;
    if (textareaRef.current) textareaRef.current.scrollTop = scrollTop;
    if (preRef.current) preRef.current.scrollTop = scrollTop;
  };

  // Update iframe content when HTML changes
  useEffect(() => {
    const updateIframe = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      // Create a blob URL for the HTML content
      const blob = new Blob([htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      // Update iframe src
      iframe.src = url;

      // Cleanup
      return () => URL.revokeObjectURL(url);
    };

    const cleanup = updateIframe();
    return () => {
      if (cleanup) cleanup();
    };
  }, [htmlCode]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Html2Figma</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Built with love by alfio</span>
          <a
            href="https://github.com/aliftan/html2figma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            <Github size={20} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex gap-4 p-4 flex-1 min-h-0">
        {/* Controls */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setHtmlCode('')}
            className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Clear All
          </button>
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Editor Panel */}
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-full relative">
              <textarea
                ref={textareaRef}
                onScroll={handleScroll}
                className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none font-[family-name:var(--font-geist-mono)] bg-transparent absolute inset-0 text-transparent caret-black overflow-auto placeholder-transparent"
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                spellCheck={false}
              />
              <Highlight
                theme={themes.github}
                code={htmlCode || ' '}
                language="html"
              >
                {({ tokens, getLineProps, getTokenProps }) => (
                  <pre
                    ref={preRef}
                    onScroll={handleScroll}
                    className="w-full h-full p-4 font-mono text-sm whitespace-pre-wrap break-words overflow-auto"
                  >
                    {htmlCode ? (
                      tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">Paste your HTML here...</span>
                    )}
                  </pre>
                )}
              </Highlight>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 border border-gray-200 rounded-lg flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
              <span className="text-sm text-gray-600">Preview</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewport('desktop')}
                  className={`px-3 py-1 text-sm rounded-md ${viewport === 'desktop'
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setViewport('mobile')}
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
                  sandbox="allow-scripts"
                  title="Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}