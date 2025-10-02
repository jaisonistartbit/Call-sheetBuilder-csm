import React, { useState } from 'react';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import AGGridTable from './AGGridTable';

const DraggableContainer = ({
  container,
  onDelete,
  onAddChild,
  onUpdatePosition,
  onUpdateSize,
  level = 0
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleDragStart = (e) => {
    // Only drag if clicking on the drag handle
    if (!e.target.closest('.drag-handle')) return;

    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - container.x,
      y: e.clientY - container.y
    });
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    onUpdatePosition(container.id, newX, newY);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: container.width,
      height: container.height
    });
  };

  const handleResize = (e) => {
    if (!isResizing) return;
    e.preventDefault();

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const newWidth = Math.max(200, resizeStart.width + deltaX);
    const newHeight = Math.max(150, resizeStart.height + deltaY);

    onUpdateSize(container.id, newWidth, newHeight);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging]);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing]);

  const bgColors = [
    'bg-blue-50 border-blue-300',
    'bg-purple-50 border-purple-300',
    'bg-green-50 border-green-300',
    'bg-orange-50 border-orange-300'
  ];

  const renderContent = () => {
    if (container.contentType === 'table') {
      return <AGGridTable />;
    }

    return (
      <div className="text-gray-700">
        <h3 className="font-semibold text-lg mb-2">{container.title}</h3>
        <p className="text-sm">{container.content}</p>
      </div>
    );
  };

  return (
    <div
      className={`absolute border-2 rounded-lg shadow-lg ${bgColors[level % bgColors.length]} ${
        isDragging ? 'opacity-70 cursor-grabbing z-50' : 'cursor-default'
      }`}
      style={{
        left: `${container.x}px`,
        top: `${container.y}px`,
        width: `${container.width}px`,
        height: `${container.height}px`,
        minWidth: '200px',
        minHeight: '150px'
      }}
      onMouseDown={handleDragStart}
    >
      {/* Header with controls */}
      <div className="flex items-center justify-between p-2 border-b bg-white bg-opacity-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded">
            <GripVertical size={18} className="text-gray-600" />
          </div>
          <span className="font-medium text-sm text-gray-700">Container #{container.id}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(container.id);
            }}
            className="p-1 hover:bg-green-200 rounded transition-colors"
            title="Add nested container"
          >
            <Plus size={18} className="text-green-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(container.id);
            }}
            className="p-1 hover:bg-red-200 rounded transition-colors"
            title="Delete container"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="p-3 overflow-auto" style={{ height: 'calc(100% - 44px)' }}>
        {renderContent()}

        {/* Render children */}
        {container.children && container.children.length > 0 && (
          <div className="relative mt-2">
            {container.children.map(child => (
              <DraggableContainer
                key={child.id}
                container={child}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onUpdatePosition={onUpdatePosition}
                onUpdateSize={onUpdateSize}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-gray-400 hover:bg-gray-600 rounded-tl"
        onMouseDown={handleResizeStart}
        style={{ borderBottomRightRadius: '0.375rem' }}
      />
    </div>
  );
};

export default DraggableContainer;
