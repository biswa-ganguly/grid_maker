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
      const classNames = `col-span-${item.w} row-span-${item.h} bg-gray-200 p-4 rounded`;
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <button onClick={addItem} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            ➕ Add Box
          </button>
          <button onClick={copyToClipboard} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            📋 Copy Code
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Code Format:</label>
          <select
            value={codeFormat}
            onChange={e => setCodeFormat(e.target.value as 'html' | 'react')}
            className="px-2 py-1 border rounded"
          >
            <option value="html">HTML + Tailwind</option>
            <option value="react">React JSX + Tailwind</option>
          </select>
        </div>
      </div>

      {/* Bin Area */}
      <div
        ref={binRef}
        className="h-16 bg-red-100 border-2 border-red-400 border-dashed rounded flex items-center justify-center text-red-700 font-semibold"
      >
        🗑 Drag here to delete a box
      </div>

      {/* Grid Area */}
      <div className="bg-gray-100 p-4 rounded border shadow-inner">
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
            <div key={item.i} className="relative bg-blue-100 border rounded p-2 shadow-md">
              <button
                onClick={() => removeItem(item.i)}
                className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                title="Remove box"
              >
                🗑
              </button>
              <span className="text-sm font-medium">Box {item.i}</span>
            </div>
          ))}
        </GridLayout>
      </div>

      {/* Code Output */}
      <div>
        <h2 className="font-bold text-lg mb-2">🔧 Generated Code:</h2>
        <pre className="bg-black text-green-400 p-4 rounded text-sm whitespace-pre-wrap overflow-x-auto">
{`<div class="${codeFormat === 'html' ? 'grid grid-cols-12 gap-4' : 'grid grid-cols-12 gap-4'}">\n${generateCode()}\n</div>`}
        </pre>
      </div>
    </div>
  );
};

export default GridBuilder;
