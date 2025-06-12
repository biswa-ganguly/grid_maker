import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Trash2, Copy, Plus, Grid, Code,  Settings } from 'lucide-react';

interface GridItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface GridSettings {
  cols: number;
  rows: number;
  gap: number;
  cellSize: number;
}

const GridBuilder: React.FC = () => {
  const [items, setItems] = useState<GridItem[]>([
    { id: '1', x: 0, y: 0, width: 3, height: 2, label: 'Header' },
    { id: '2', x: 0, y: 2, width: 2, height: 3, label: 'Sidebar' },
    { id: '3', x: 2, y: 2, width: 4, height: 3, label: 'Main Content' },
  ]);
  
  const [settings, setSettings] = useState<GridSettings>({
    cols: 12,
    rows: 8,
    gap: 16,
    cellSize: 60
  });
  
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [codeFormat, setCodeFormat] = useState<'css' | 'tailwind' | 'scss'>('css');
  const [showSettings, setShowSettings] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [itemStart, setItemStart] = useState({ x: 0, y: 0 });

  const gridWidth = settings.cols * settings.cellSize + (settings.cols - 1) * settings.gap;
  const gridHeight = settings.rows * settings.cellSize + (settings.rows - 1) * settings.gap;

  const snapToGrid = useCallback((x: number, y: number) => {
    const cellWithGap = settings.cellSize + settings.gap;
    const col = Math.round(x / cellWithGap);
    const row = Math.round(y / cellWithGap);
    return {
      x: Math.max(0, Math.min(col, settings.cols - 1)),
      y: Math.max(0, Math.min(row, settings.rows - 1))
    };
  }, [settings]);

  const getItemStyle = (item: GridItem): React.CSSProperties => ({
    position: 'absolute',
    left: item.x * (settings.cellSize + settings.gap),
    top: item.y * (settings.cellSize + settings.gap),
    width: item.width * settings.cellSize + (item.width - 1) * settings.gap,
    height: item.height * settings.cellSize + (item.height - 1) * settings.gap,
    zIndex: selectedItem === item.id ? 10 : 1,
  });

  const handleMouseDown = (e: React.MouseEvent, itemId: string, action: 'drag' | 'resize') => {
    e.preventDefault();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSelectedItem(itemId);
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setItemStart({ x: item.x, y: item.y });

    if (action === 'drag') {
      setDraggedItem(itemId);
    } else {
      setIsResizing(itemId);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedItem && !isResizing) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    if (draggedItem) {
      const newPos = snapToGrid(
        itemStart.x * (settings.cellSize + settings.gap) + deltaX,
        itemStart.y * (settings.cellSize + settings.gap) + deltaY
      );
      
      setItems(prev => prev.map(item => 
        item.id === draggedItem 
          ? { ...item, x: newPos.x, y: newPos.y }
          : item
      ));
    } else if (isResizing) {
      const cellWithGap = settings.cellSize + settings.gap;
      const newWidth = Math.max(1, Math.round((deltaX + settings.cellSize) / cellWithGap));
      const newHeight = Math.max(1, Math.round((deltaY + settings.cellSize) / cellWithGap));
      
      setItems(prev => prev.map(item => 
        item.id === isResizing
          ? { 
              ...item, 
              width: Math.min(newWidth, settings.cols - item.x),
              height: Math.min(newHeight, settings.rows - item.y)
            }
          : item
      ));
    }
  }, [draggedItem, isResizing, dragStart, itemStart, settings, snapToGrid]);

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (draggedItem || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, isResizing, handleMouseMove, handleMouseUp]);

  const addItem = () => {
    const newItem: GridItem = {
      id: Date.now().toString(),
      x: 0,
      y: 0,
      width: 2,
      height: 2,
      label: `Item ${items.length + 1}`
    };
    setItems(prev => [...prev, newItem]);
    setSelectedItem(newItem.id);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedItem(null);
  };

  const generateCode = () => {
    const containerClass = codeFormat === 'tailwind' 
      ? `grid grid-cols-${settings.cols} gap-${Math.round(settings.gap / 4)}`
      : 'grid-container';

    const containerCSS = codeFormat === 'css' 
      ? `.grid-container {
  display: grid;
  grid-template-columns: repeat(${settings.cols}, 1fr);
  gap: ${settings.gap}px;
  width: 100%;
  max-width: ${gridWidth}px;
  margin: 0 auto;
}`
      : codeFormat === 'scss'
      ? `$grid-cols: ${settings.cols};
$grid-gap: ${settings.gap}px;

.grid-container {
  display: grid;
  grid-template-columns: repeat($grid-cols, 1fr);
  gap: $grid-gap;
  width: 100%;
  max-width: ${gridWidth}px;
  margin: 0 auto;
}`
      : '';

    const itemsCode = items.map(item => {
      const itemClass = codeFormat === 'tailwind'
        ? `col-span-${item.width} row-span-${item.height}`
        : `grid-item-${item.id}`;
      
      const itemCSS = codeFormat === 'css'
        ? `.grid-item-${item.id} {
  grid-column: span ${item.width};
  grid-row: span ${item.height};
}`
        : codeFormat === 'scss'
        ? `.grid-item-${item.id} {
  grid-column: span ${item.width};
  grid-row: span ${item.height};
}`
        : '';

      return {
        html: `<div class="${itemClass}">${item.label}</div>`,
        css: itemCSS
      };
    });

    const htmlCode = `<div class="${containerClass}">
${itemsCode.map(item => '  ' + item.html).join('\n')}
</div>`;

    const cssCode = codeFormat !== 'tailwind' 
      ? `${containerCSS}\n\n${itemsCode.map(item => item.css).join('\n\n')}`
      : '';

    return { html: htmlCode, css: cssCode };
  };

  const copyToClipboard = () => {
    const code = generateCode();
    const fullCode = codeFormat === 'tailwind' 
      ? code.html 
      : `${code.css}\n\n${code.html}`;
    
    navigator.clipboard.writeText(fullCode);
    alert('Code copied to clipboard!');
  };

  const selectedItemData = items.find(item => item.id === selectedItem);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Grid className="w-6 h-6 text-blue-600" />
                Professional Grid Builder
              </h1>
              <p className="text-gray-600 mt-1">Design responsive grid layouts with precision</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Grid Settings</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
                <input
                  type="number"
                  value={settings.cols}
                  onChange={(e) => setSettings(prev => ({ ...prev, cols: parseInt(e.target.value) || 12 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rows</label>
                <input
                  type="number"
                  value={settings.rows}
                  onChange={(e) => setSettings(prev => ({ ...prev, rows: parseInt(e.target.value) || 8 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gap (px)</label>
                <input
                  type="number"
                  value={settings.gap}
                  onChange={(e) => setSettings(prev => ({ ...prev, gap: parseInt(e.target.value) || 16 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cell Size (px)</label>
                <input
                  type="number"
                  value={settings.cellSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, cellSize: parseInt(e.target.value) || 60 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="30"
                  max="150"
                />
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
              {selectedItem && (
                <button
                  onClick={() => removeItem(selectedItem)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <select
                value={codeFormat}
                onChange={(e) => setCodeFormat(e.target.value as 'css' | 'tailwind' | 'scss')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="css">CSS Grid</option>
                <option value="scss">SCSS Grid</option>
                <option value="tailwind">Tailwind CSS</option>
              </select>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Code
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grid Designer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Design Canvas</h3>
              <div className="overflow-auto border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <div
                  ref={containerRef}
                  className="relative bg-white border border-gray-300 rounded-lg"
                  style={{
                    width: gridWidth,
                    height: gridHeight,
                    backgroundImage: `
                      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: `${settings.cellSize + settings.gap}px ${settings.cellSize + settings.gap}px`,
                    backgroundPosition: `${settings.gap / 2}px ${settings.gap / 2}px`
                  }}
                >
                  {/* Grid Items */}
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={`bg-blue-100 border-2 rounded-lg cursor-move transition-all duration-200 ${
                        selectedItem === item.id
                          ? 'border-blue-500 shadow-lg'
                          : 'border-blue-300 hover:border-blue-400'
                      }`}
                      style={getItemStyle(item)}
                      onMouseDown={(e) => handleMouseDown(e, item.id, 'drag')}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <div className="p-2 h-full flex flex-col">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => setItems(prev => prev.map(i => 
                            i.id === item.id ? { ...i, label: e.target.value } : i
                          ))}
                          className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-full"
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                        <div className="text-xs text-gray-500 mt-auto">
                          {item.width} × {item.height}
                        </div>
                      </div>
                      {/* Resize Handle */}
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
                        style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown(e, item.id, 'resize');
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="space-y-6">
            {/* Item Properties */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Item Properties</h3>
              {selectedItemData ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                    <input
                      type="text"
                      value={selectedItemData.label}
                      onChange={(e) => setItems(prev => prev.map(item => 
                        item.id === selectedItem ? { ...item, label: e.target.value } : item
                      ))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                      <input
                        type="number"
                        value={selectedItemData.width}
                        onChange={(e) => setItems(prev => prev.map(item => 
                          item.id === selectedItem 
                            ? { ...item, width: Math.max(1, Math.min(parseInt(e.target.value) || 1, settings.cols - item.x)) }
                            : item
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max={settings.cols - selectedItemData.x}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                      <input
                        type="number"
                        value={selectedItemData.height}
                        onChange={(e) => setItems(prev => prev.map(item => 
                          item.id === selectedItem 
                            ? { ...item, height: Math.max(1, Math.min(parseInt(e.target.value) || 1, settings.rows - item.y)) }
                            : item
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max={settings.rows - selectedItemData.y}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">X Position</label>
                      <input
                        type="number"
                        value={selectedItemData.x}
                        onChange={(e) => setItems(prev => prev.map(item => 
                          item.id === selectedItem 
                            ? { ...item, x: Math.max(0, Math.min(parseInt(e.target.value) || 0, settings.cols - item.width)) }
                            : item
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max={settings.cols - selectedItemData.width}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Y Position</label>
                      <input
                        type="number"
                        value={selectedItemData.y}
                        onChange={(e) => setItems(prev => prev.map(item => 
                          item.id === selectedItem 
                            ? { ...item, y: Math.max(0, Math.min(parseInt(e.target.value) || 0, settings.rows - item.height)) }
                            : item
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max={settings.rows - selectedItemData.height}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Select an item to edit its properties</p>
              )}
            </div>

            {/* Code Preview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code Preview
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 text-sm text-green-400 font-mono overflow-auto max-h-80">
                <pre>{codeFormat === 'tailwind' ? generateCode().html : `${generateCode().css}\n\n${generateCode().html}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridBuilder;