"use client";

import { useState, useRef } from 'react';
import { Github, Trash2, Clipboard, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Highlight } from 'prism-react-renderer';
import { HTMLPreview } from './components/HTMLPreview';

export default function Home() {
  const [htmlCode, setHtmlCode] = useState('');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const { scrollTop } = e.currentTarget;
    if (textareaRef.current) textareaRef.current.scrollTop = scrollTop;
    if (preRef.current) preRef.current.scrollTop = scrollTop;
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setHtmlCode(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const toggleEditor = () => {
    setIsEditorVisible(!isEditorVisible);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">HTMLplay</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Crafted by alfio</span>
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

      <div className="flex gap-4 p-4 flex-1 min-h-0">
        <div className={`flex-1 flex flex-col lg:flex-row min-h-0 transition-all duration-300 ${isEditorVisible ? 'gap-4' : ''}`}>
          {/* Editor Panel */}
          <div className={`border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-[300px] lg:min-h-0 transition-all duration-300 ${!isEditorVisible ? 'w-0 min-w-0 opacity-0 invisible' : 'flex-1 visible'}`}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
              <span className="text-sm text-gray-600">Editor</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setHtmlCode('')}
                  className="px-3 py-1 text-sm rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Clear
                </button>
                <button
                  onClick={handlePaste}
                  className="px-3 py-1 text-sm rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Clipboard size={14} />
                  Paste
                </button>
                <button
                  onClick={toggleEditor}
                  className="px-3 py-1 text-sm rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                >
                  <PanelLeftClose size={14} />
                  Hide
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden relative hover-scroll">
              <textarea
                ref={textareaRef}
                onScroll={handleScroll}
                className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none font-[family-name:var(--font-geist-mono)] bg-transparent absolute inset-0 text-transparent caret-gray-800 overflow-auto z-10 scrollbar-hide hover:scrollbar-default focus:scrollbar-default"
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                spellCheck={false}
              />
              <Highlight
                theme={{
                  plain: {
                    color: "#000000",
                    backgroundColor: "#ffffff",
                  },
                  styles: [
                    {
                      types: ["tag", "doctype"],
                      style: {
                        color: "#22863a"
                      }
                    },
                    {
                      types: ["attr-name"],
                      style: {
                        color: "#6f42c1"
                      }
                    },
                    {
                      types: ["attr-value", "string"],
                      style: {
                        color: "#032f62"
                      }
                    },
                    {
                      types: ["comment"],
                      style: {
                        color: "#6a737d",
                        fontStyle: 'italic'
                      }
                    },
                    {
                      types: ["script"],
                      style: {
                        color: "#24292e"
                      }
                    }
                  ]
                }}
                code={htmlCode || ' '}
                language="html"
              >
                {({ tokens, getLineProps, getTokenProps }) => (
                  <pre
                    ref={preRef}
                    onScroll={handleScroll}
                    className="w-full h-full p-4 font-mono text-sm whitespace-pre-wrap break-words overflow-auto absolute inset-0 pointer-events-none scrollbar-hide hover:scrollbar-default focus:scrollbar-default"
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
          <div className={`flex flex-col min-h-0 transition-all duration-300 ${!isEditorVisible ? 'flex-1 w-full' : 'flex-1'}`}>
            {!isEditorVisible && (
              <button
                onClick={toggleEditor}
                className="mb-4 px-3 py-1 text-sm rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2 self-start"
              >
                <PanelLeft size={14} />
                Show Editor
              </button>
            )}
            <HTMLPreview
              code={htmlCode}
              viewport={viewport}
              onViewportChange={setViewport}
              iframeRef={iframeRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}