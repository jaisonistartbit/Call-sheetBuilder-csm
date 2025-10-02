import { useRef, useEffect, useState } from 'react';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import GridLayout from 'react-grid-layout';
import AGGridTable from './AGGridTable';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const GridContainer = ({ container, onDelete, onAddChild, onLayoutChange, onUpdateSize, level = 0 }) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 20);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Auto-size container based on content height (only once on mount)
  useEffect(() => {
    const updateSize = () => {
      if (contentRef.current && onUpdateSize) {
        const contentHeight = contentRef.current.scrollHeight;
        const headerHeight = 60; // Approximate header height
        const padding = 50; // Extra padding
        const totalHeight = contentHeight + headerHeight + padding;

        // Convert to grid units (rowHeight is passed from parent)
        const rowHeight = level === 0 ? 50 : 30;
        const gridUnits = Math.ceil(totalHeight / rowHeight);

        // Only update if the current height is different from calculated
        if (container.h !== gridUnits) {
          console.log(`Container ${container.id}: content=${contentHeight}px, total=${totalHeight}px, gridUnits=${gridUnits}, current=${container.h}`);
          onUpdateSize(container.id, gridUnits);
        }
      }
    };

    // Update size after a short delay to ensure content is rendered
    const timer = setTimeout(updateSize, 200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container.contentType, container.children?.length]);

  const bgColors = [
    'bg-indigo-600',
    'bg-pink-600',
    'bg-cyan-600',
    'bg-amber-600',
    'bg-emerald-600'
  ];

  const bgLight = [
    'bg-indigo-50',
    'bg-pink-50',
    'bg-cyan-50',
    'bg-amber-50',
    'bg-emerald-50'
  ];

  const borderColors = [
    'border-indigo-100',
    'border-pink-100',
    'border-cyan-100',
    'border-amber-100',
    'border-emerald-100'
  ];

  const renderContent = () => {
    if (container.contentType === 'table') {
      return (
        <div className="h-full w-full">
          <AGGridTable />
        </div>
      );
    }

    return (
      <div className="text-gray-800 space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-8 ${bgColors[level % bgColors.length]} rounded-full`}></div>
          <h3 className="font-bold text-xl text-gray-900">{container.title}</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed pl-3">{container.content}</p>
        <div className="grid grid-cols-3 gap-2 mt-4 pl-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</div>
            <div className="font-semibold text-green-600">Active</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Priority</div>
            <div className="font-semibold text-blue-600">High</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Progress</div>
            <div className="font-semibold text-purple-600">75%</div>
          </div>
        </div>
      </div>
    );
  };

  const handleNestedLayoutChange = (newLayout) => {
    if (onLayoutChange) {
      onLayoutChange(container.id, newLayout);
    }
  };

  const nestedLayout = container.children && container.children.length > 0
    ? container.children.map(child => ({
      i: child.id,
      x: child.x,
      y: child.y,
      w: child.w,
      h: child.h,
      minW: 2,
      minH: 2
    }))
    : [];

  const dragHandleClass = `drag-handle-level-${level}`;

  return (
    <div className={`h-full rounded-xl shadow-md overflow-hidden flex flex-col border ${borderColors[level % borderColors.length]} ${bgLight[level % bgLight.length]}`}>
      {/* Beautiful Header with gradient */}
      <div className={`flex items-center justify-between px-4 py-3 ${bgColors[level % bgColors.length]} text-white shadow-lg no-print-controls`}>
        <div className={`flex items-center gap-3 flex-1 ${dragHandleClass} cursor-move`}>
          <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
            <GripVertical size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-wide">
              {container.title || `Container #${container.id}`}
            </span>
            <span className="text-xs text-white text-opacity-80">Level {level}</span>
          </div>
        </div>
        <div className="flex gap-2 no-print-controls">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Add child button clicked for container:', container.id);
              onAddChild(container.id);
            }}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
            title="Add nested container"
          >
            <Plus size={18} className="text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete button clicked for container:', container.id);
              onDelete(container.id);
            }}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
            title="Delete container"
          >
            <Trash2 size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Content with better padding and styling */}
      <div className="flex-1 overflow-hidden bg-white" ref={containerRef}>
        {container.children && container.children.length > 0 ? (
          <div className="h-full w-full p-4" ref={contentRef}>
            <GridLayout
              className="layout"
              layout={nestedLayout}
              cols={12}
              rowHeight={30}
              width={containerWidth}
              onLayoutChange={handleNestedLayoutChange}
              compactType="vertical"
              preventCollision={true}
              isDraggable={true}
              isResizable={true}
              draggableHandle={`.drag-handle-level-${level + 1}`}
              margin={[0, 0]}
              containerPadding={[0, 0]}
            >
              {container.children.map(child => (
                <div key={child.id}>
                  <GridContainer
                    container={child}
                    onDelete={onDelete}
                    onAddChild={onAddChild}
                    onLayoutChange={onLayoutChange}
                    onUpdateSize={onUpdateSize}
                    level={level + 1}
                  />
                </div>
              ))}
            </GridLayout>
          </div>
        ) : (
          <div className="p-6 h-full" ref={contentRef}>
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default GridContainer;
