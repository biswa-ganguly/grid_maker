import { useRef, useState } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const GridBuilder = () => {
  const [layout, setLayout] = useState<Layout[]>([
    { i: '1', x: 0, y: 0, w: 3, h: 2 },
  ]);

  const [codeFormat, setCodeFormat] = useState<'html' | 'react'>('html');
  const binRef = useRef<HTMLDivElement | null>(null);

  const addItem = () => {
    const newItem = {
      i: String(Date.now()), // Unique ID
      x: (layout.length * 3) % 12,
      y: Infinity,
      w: 3,
      h: 2,
    };
    setLayout([...layout, newItem]);
  };

  const removeItem = (id: string) => {
    setLayout(layout.filter(item => item.i !== id));
  };

  const generateCode = () => {
    return layout.map(item => {
      const classNames = `col-span-${item.w} row-span-${item.h} bg-gray-100 p-4 rounded-lg shadow-sm`;
      return codeFormat === 'html'
        ? `<div class="${classNames}">Box ${item.i}</div>`
        : `<div className="${classNames}">Box ${item.i}</div>`;
    }).join('\n');
  };

  const copyToClipboard = () => {
    const code = `<div class="${codeFormat === 'html' ? 'grid grid-cols-12 gap-4' : 'grid grid-cols-12 gap-4'}">\n${generateCode()}\n</div>`;
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const handleDrop = (_layout: Layout[], item: Layout, e: DragEvent) => {
    const bin = binRef.current;
    if (!bin) return;

    const binRect = bin.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const isInBin =
      mouseX >= binRect.left &&
      mouseX <= binRect.right &&
      mouseY >= binRect.top &&
      mouseY <= binRect.bottom;

    if (isInBin) {
      removeItem(item.i);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center border-b border-gray-700 pb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Grid Builder Pro
          </h1>
          <p className="text-gray-400 text-lg">Professional CSS Grid Layout Designer</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-4 bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
          <div className="flex gap-3">
            <button 
              onClick={addItem} 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/20 font-medium flex items-center gap-2"
            >
              <span className="text-lg">+</span> Add Box
            </button>
            <button 
              onClick={copyToClipboard} 
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-emerald-500/20 font-medium flex items-center gap-2"
            >
              <span className="text-lg">📋</span> Copy Code
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-300">Code Format:</label>
            <select
              value={codeFormat}
              onChange={e => setCodeFormat(e.target.value as 'html' | 'react')}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="html">HTML + Tailwind</option>
              <option value="react">React JSX + Tailwind</option>
            </select>
          </div>
        </div>

        {/* Bin Area */}
        <div
          ref={binRef}
          className="h-20 bg-gradient-to-r from-red-900/20 to-red-800/20 border-2 border-red-500/50 border-dashed rounded-xl flex items-center justify-center text-red-400 font-semibold text-lg backdrop-blur-sm hover:border-red-400 transition-colors duration-200"
        >
          <span className="text-2xl mr-2">🗑️</span> Drag here to delete a box
        </div>

        {/* Grid Area */}
        <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-2xl">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
              <span className="text-blue-400">⚡</span> Design Canvas
            </h2>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
            <GridLayout
              className="layout"
              layout={layout}
              cols={12}
              rowHeight={30}
              width={1200}
              onLayoutChange={setLayout}
              onDrop={handleDrop}
              isDraggable
              isResizable
              compactType={null}
              preventCollision
            >
              {layout.map(item => (
                <div key={item.i} className="relative bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm">
                  <button
                    onClick={() => removeItem(item.i)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200"
                    title="Remove box"
                  >
                    ×
                  </button>
                  <span className="text-sm font-medium text-gray-200">Box {item.i}</span>
                  <div className="mt-1 text-xs text-gray-400">
                    {item.w} × {item.h}
                  </div>
                </div>
              ))}
            </GridLayout>
          </div>
        </div>

        {/* Code Output */}
        <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
          <h2 className="font-bold text-xl mb-4 text-gray-200 flex items-center gap-2">
            <span className="text-green-400">🔧</span> Generated Code
          </h2>
          <div className="relative">
            <pre className="bg-black/80 text-green-400 p-6 rounded-lg text-sm whitespace-pre-wrap overflow-x-auto border border-gray-600 font-mono leading-relaxed">
{`<div class="${codeFormat === 'html' ? 'grid grid-cols-12 gap-4' : 'grid grid-cols-12 gap-4'}">\n${generateCode()}\n</div>`}
            </pre>
            <div className="absolute top-4 right-4">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 text-xs rounded transition-colors duration-200"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="text-center pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Created with care by{' '}
            <a 
              href="https://github.com/ganguly" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              @ganguly
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GridBuilder;