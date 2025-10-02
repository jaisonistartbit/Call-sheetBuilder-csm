import { useState, useRef, useEffect } from 'react';
import { Plus, Grid3x3, Download } from 'lucide-react';
import GridLayout from 'react-grid-layout';
import GridContainer from './GridContainer';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const GridLayoutCanvas = () => {
  const gridRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [gridWidth, setGridWidth] = useState(1200);

  const [containers, setContainers] = useState([
    {
      id: '1',
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      title: 'Welcome Container',
      content: 'This is a draggable and resizable container. Click the + icon to add nested containers!',
      children: []
    },
    {
      id: '2',
      x: 6,
      y: 0,
      w: 6,
      h: 12,
      contentType: 'table',
      title: 'Data Table',
      content: '',
      children: []
    },
    {
      id: '3',
      x: 0,
      y: 4,
      w: 6,
      h: 3,
      title: 'Analytics Dashboard',
      content: 'Monitor your key performance indicators in real-time.',
      children: []
    }
  ]);

  const [nextId, setNextId] = useState(4);

  useEffect(() => {
    const updateGridWidth = () => {
      if (gridRef.current) {
        const containerWidth = gridRef.current.offsetWidth;
        setGridWidth(containerWidth - 48); // Subtract padding
      }
    };

    updateGridWidth();
    window.addEventListener('resize', updateGridWidth);
    return () => window.removeEventListener('resize', updateGridWidth);
  }, []);

  const generateSampleData = (id) => {
    const titles = [
      'Analytics Dashboard',
      'Performance Metrics',
      'User Statistics',
      'Sales Report',
      'Task Manager',
      'Notification Center',
      'Team Workspace',
      'Project Overview'
    ];
    const contents = [
      'Monitor your key performance indicators in real-time.',
      'Track and analyze performance across different metrics.',
      'View user engagement and activity statistics.',
      'Comprehensive sales data and trends analysis.',
      'Manage and organize your daily tasks efficiently.',
      'Stay updated with important notifications and alerts.',
      'Collaborate with team members on projects.',
      'Get a bird\'s eye view of all ongoing projects.'
    ];

    const index = parseInt(id) % titles.length;
    return {
      title: titles[index],
      content: contents[index]
    };
  };

  const addContainer = () => {
    const sampleData = generateSampleData(nextId);

    const newContainer = {
      id: nextId.toString(),
      x: (containers.length * 2) % 12,
      y: Infinity,
      w: 4,
      h: 4,
      title: sampleData.title,
      content: sampleData.content,
      children: []
    };

    setContainers([...containers, newContainer]);
    setNextId(nextId + 1);
  };

  const addChildContainer = (parentId) => {
    console.log('Adding child to parent:', parentId);
    const sampleData = generateSampleData(nextId);

    const addChildRecursive = (containerList) => {
      return containerList.map(container => {
        if (container.id === parentId) {
          const existingChildren = container.children || [];
          console.log('Found parent, existing children:', existingChildren.length);

          const newChild = {
            id: `child-${nextId}`,
            x: (existingChildren.length * 3) % 12,
            y: Infinity,
            w: 4,
            h: 3,
            title: sampleData.title,
            content: sampleData.content,
            children: []
          };

          return {
            ...container,
            children: [...existingChildren, newChild]
          };
        }

        if (container.children && container.children.length > 0) {
          return {
            ...container,
            children: addChildRecursive(container.children)
          };
        }

        return container;
      });
    };

    const updated = addChildRecursive(containers);
    console.log('Updated containers:', updated);
    setContainers(updated);
    setNextId(nextId + 1);
  };

  const deleteContainer = (id) => {
    console.log('Deleting container:', id);
    const deleteRecursive = (containerList) => {
      return containerList
        .filter(container => container.id !== id)
        .map(container => ({
          ...container,
          children: container.children ? deleteRecursive(container.children) : []
        }));
    };

    const updated = deleteRecursive(containers);
    console.log('After delete:', updated);
    setContainers(updated);
  };

  const handleLayoutChange = (newLayout) => {
    const updatedContainers = containers.map(container => {
      const layoutItem = newLayout.find(l => l.i === container.id);
      if (layoutItem) {
        return {
          ...container,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h
        };
      }
      return container;
    });
    setContainers(updatedContainers);
  };

  const handleNestedLayoutChange = (parentId, newLayout) => {
    const updateNestedRecursive = (containerList) => {
      return containerList.map(container => {
        if (container.id === parentId && container.children) {
          const updatedChildren = container.children.map(child => {
            const layoutItem = newLayout.find(l => l.i === child.id);
            if (layoutItem) {
              return {
                ...child,
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h
              };
            }
            return child;
          });

          return {
            ...container,
            children: updatedChildren
          };
        }

        if (container.children && container.children.length > 0) {
          return {
            ...container,
            children: updateNestedRecursive(container.children)
          };
        }

        return container;
      });
    };

    setContainers(updateNestedRecursive(containers));
  };

  const handleUpdateSize = (containerId, gridUnits) => {
    const updateSizeRecursive = (containerList) => {
      return containerList.map(container => {
        if (container.id === containerId) {
          // Only update if height is actually different
          if (container.h === gridUnits) {
            return container;
          }
          return {
            ...container,
            h: gridUnits
          };
        }

        if (container.children && container.children.length > 0) {
          return {
            ...container,
            children: updateSizeRecursive(container.children)
          };
        }

        return container;
      });
    };

    const updated = updateSizeRecursive(containers);
    // Only update state if something actually changed
    if (JSON.stringify(updated) !== JSON.stringify(containers)) {
      setContainers(updated);
    }
  };

  const generatePDF = async () => {
    console.log('=== PDF Generation Started ===');

    if (!gridRef.current) {
      console.error('ERROR: gridRef.current is null');
      return;
    }

    console.log('Grid ref element:', gridRef.current);
    setIsGeneratingPDF(true);

    try {
      console.log('Step 1: Hiding control elements...');
      // Hide all control buttons and resize handles
      const controlElements = document.querySelectorAll('.no-print-controls, .react-resizable-handle');
      console.log('Control elements found:', controlElements.length);
      controlElements.forEach(el => {
        el.style.display = 'none';
      });

      console.log('Step 2: Waiting for render (100ms)...');
      // Wait for next render
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Step 3: Starting html2canvas capture...');
      console.log('Grid dimensions:', {
        scrollWidth: gridRef.current.scrollWidth,
        scrollHeight: gridRef.current.scrollHeight,
        offsetWidth: gridRef.current.offsetWidth,
        offsetHeight: gridRef.current.offsetHeight
      });
      console.log(gridRef.current);


      const canvas = await html2canvas(gridRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#f9fafb'
      });

      console.log('Step 4: Canvas created successfully');
      console.log('Canvas dimensions:', {
        width: canvas.width,
        height: canvas.height
      });

      console.log('Step 5: Converting canvas to image...');
      const imgData = canvas.toDataURL('image/png');
      console.log('Image data length:', imgData.length);

      console.log('Step 6: Creating PDF...');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      console.log('Step 7: Adding image to PDF...');
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

      console.log('Step 8: Saving PDF...');
      pdf.save('grid-layout.pdf');

      console.log('Step 9: Restoring control buttons...');
      // Restore control buttons
      controlElements.forEach(el => {
        el.style.display = '';
      });

      console.log('=== PDF Generation Completed Successfully ===');
    } catch (error) {
      console.error('=== PDF Generation FAILED ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);

      alert('Failed to generate PDF. Check console for details.\nError: ' + error.message);

      // Restore control buttons even on error
      const controlElements = document.querySelectorAll('.no-print-controls, .react-resizable-handle');
      controlElements.forEach(el => {
        el.style.display = '';
      });
    } finally {
      setIsGeneratingPDF(false);
      console.log('PDF generation state reset');
    }
  };

  const layout = containers.map(container => ({
    i: container.id,
    x: container.x,
    y: container.y,
    w: container.w,
    h: container.h,
    minW: 2,
    minH: 2
  }));

  return (
    <div className="min-h-screen  ">
      {/* Header */}
      <div className="bg-white border-b  shadow-md sticky top-0 z-50 backdrop-blur-sm bg-opacity-95  ">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2   rounded-xl shadow-lg">
                <Grid3x3 className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">
                  Flexible Grid Layout
                </h1>
                <p className="text-xs text-gray-500">Drag, resize, and organize your containers</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-2   text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={addContainer}
                className="flex items-center gap-2 px-4 py-2   text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus size={20} />
                Add Container
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas with Grid Layout */}
      <div className="p-6 mt-[50px] " ref={gridRef}> 
        {containers.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Grid3x3 className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg">No containers yet. Click &quot;Add Container&quot; to start!</p>
            </div>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={50}
            width={gridWidth}
            onLayoutChange={handleLayoutChange}
            compactType="vertical"
            preventCollision={true}
            isDraggable={true}
            isResizable={true}
            draggableHandle=".drag-handle-level-0"
            margin={[0, 0]}
            containerPadding={[0, 0]}
          >
            {(containers ?? [])?.map(container => (
              <div key={container.id}>
                <GridContainer
                  container={container}
                  onDelete={deleteContainer}
                  onAddChild={addChildContainer}
                  onLayoutChange={handleNestedLayoutChange}
                  onUpdateSize={handleUpdateSize}
                  level={0}
                />
              </div>
            ))}
          </GridLayout>
        )}
      </div>
    </div>
  );
};

export default GridLayoutCanvas;


/*
client:495 [vite] connecting...
client:618 [vite] connected.
chunk-WRD5HZVH.js?v=baa9d230:21551 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
chunk-S23EU3T6.js?v=baa9d230:1424 AG Grid: error #239 Theming API and CSS File Themes are both used in the same page. In v33 we released the Theming API as the new default method of styling the grid. See the migration docs https://www.ag-grid.com/react-data-grid/theming-migration/. Because no value was provided to the `theme` grid option it defaulted to themeQuartz. But the file (ag-grid.css) is also included and will cause styling issues. Either pass the string "legacy" to the theme grid option to use v32 style themes, or remove ag-grid.css from the page to use Theming API. 
See https://www.ag-grid.com/react-data-grid/errors/239?_version_=34.2.0
(anonymous) @ chunk-S23EU3T6.js?v=baa9d230:1424
_doOnce @ chunk-S23EU3T6.js?v=baa9d230:1079
_errorOnce @ chunk-S23EU3T6.js?v=baa9d230:1424
getMsgOrDefault @ chunk-S23EU3T6.js?v=baa9d230:1442
_error @ chunk-S23EU3T6.js?v=baa9d230:1509
postProcessThemeChange @ chunk-S23EU3T6.js?v=baa9d230:28043
handleThemeChange @ chunk-S23EU3T6.js?v=baa9d230:7807
postConstruct @ chunk-S23EU3T6.js?v=baa9d230:7735
(anonymous) @ chunk-S23EU3T6.js?v=baa9d230:7666
initBeans @ chunk-S23EU3T6.js?v=baa9d230:7664
init @ chunk-S23EU3T6.js?v=baa9d230:7641
AgContext @ chunk-S23EU3T6.js?v=baa9d230:7614
create @ chunk-S23EU3T6.js?v=baa9d230:39946
(anonymous) @ ag-grid-react.js?v=baa9d230:2895
commitAttachRef @ chunk-WRD5HZVH.js?v=baa9d230:17279
commitLayoutEffectOnFiber @ chunk-WRD5HZVH.js?v=baa9d230:17168
commitLayoutMountEffects_complete @ chunk-WRD5HZVH.js?v=baa9d230:17980
commitLayoutEffects_begin @ chunk-WRD5HZVH.js?v=baa9d230:17969
commitLayoutEffects @ chunk-WRD5HZVH.js?v=baa9d230:17920
commitRootImpl @ chunk-WRD5HZVH.js?v=baa9d230:19353
commitRoot @ chunk-WRD5HZVH.js?v=baa9d230:19277
finishConcurrentRender @ chunk-WRD5HZVH.js?v=baa9d230:18805
performConcurrentWorkOnRoot @ chunk-WRD5HZVH.js?v=baa9d230:18718
workLoop @ chunk-WRD5HZVH.js?v=baa9d230:197
flushWork @ chunk-WRD5HZVH.js?v=baa9d230:176
performWorkUntilDeadline @ chunk-WRD5HZVH.js?v=baa9d230:384
chunk-WRD5HZVH.js?v=baa9d230:377 [Violation] 'message' handler took 204ms
GridLayoutCanvas.jsx:213 === PDF Generation Started ===
GridLayoutCanvas.jsx:220 Grid ref element: <div class=​"p-6">​…​</div>​
GridLayoutCanvas.jsx:224 Step 1: Hiding control elements...
GridLayoutCanvas.jsx:227 Control elements found: 9
GridLayoutCanvas.jsx:232 Step 2: Waiting for render (100ms)...
GridLayoutCanvas.jsx:236 Step 3: Starting html2canvas capture...
GridLayoutCanvas.jsx:237 Grid dimensions: {scrollWidth: 1673, scrollHeight: 453, offsetWidth: 1673, offsetHeight: 450}
GridLayoutCanvas.jsx:244 #1 0ms Starting document clone with size 1707x606 scrolled to 0,0
GridLayoutCanvas.jsx:244 [Violation] Avoid using document.write(). https://developers.google.com/web/updates/2016/08/removing-document-write
DocumentCloner2.toIFrame @ html2canvas.js?v=baa9d230:5257
(anonymous) @ html2canvas.js?v=baa9d230:7728
step @ html2canvas.js?v=baa9d230:116
(anonymous) @ html2canvas.js?v=baa9d230:68
(anonymous) @ html2canvas.js?v=baa9d230:55
__awaiter @ html2canvas.js?v=baa9d230:37
renderElement @ html2canvas.js?v=baa9d230:7682
html2canvas @ html2canvas.js?v=baa9d230:7676
generatePDF @ GridLayoutCanvas.jsx:244
await in generatePDF
callCallback2 @ chunk-WRD5HZVH.js?v=baa9d230:3674
invokeGuardedCallbackDev @ chunk-WRD5HZVH.js?v=baa9d230:3699
invokeGuardedCallback @ chunk-WRD5HZVH.js?v=baa9d230:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-WRD5HZVH.js?v=baa9d230:3736
executeDispatch @ chunk-WRD5HZVH.js?v=baa9d230:7014
processDispatchQueueItemsInOrder @ chunk-WRD5HZVH.js?v=baa9d230:7034
processDispatchQueue @ chunk-WRD5HZVH.js?v=baa9d230:7043
dispatchEventsForPlugins @ chunk-WRD5HZVH.js?v=baa9d230:7051
(anonymous) @ chunk-WRD5HZVH.js?v=baa9d230:7174
batchedUpdates$1 @ chunk-WRD5HZVH.js?v=baa9d230:18913
batchedUpdates @ chunk-WRD5HZVH.js?v=baa9d230:3579
dispatchEventForPluginEventSystem @ chunk-WRD5HZVH.js?v=baa9d230:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-WRD5HZVH.js?v=baa9d230:5478
dispatchEvent @ chunk-WRD5HZVH.js?v=baa9d230:5472
dispatchDiscreteEvent @ chunk-WRD5HZVH.js?v=baa9d230:5449
html2canvas.js?v=baa9d230:7608 #1 388ms Document cloned, element located at 7.98828125,124.3359375 with size 1691.5234375x450 using computed rendering
html2canvas.js?v=baa9d230:7608 #1 389ms Starting DOM parsing
html2canvas.js?v=baa9d230:7608 #1 412ms Added image data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwID
GridLayoutCanvas.jsx:282 === PDF Generation FAILED ===
generatePDF @ GridLayoutCanvas.jsx:282
await in generatePDF
callCallback2 @ chunk-WRD5HZVH.js?v=baa9d230:3674
invokeGuardedCallbackDev @ chunk-WRD5HZVH.js?v=baa9d230:3699
invokeGuardedCallback @ chunk-WRD5HZVH.js?v=baa9d230:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-WRD5HZVH.js?v=baa9d230:3736
executeDispatch @ chunk-WRD5HZVH.js?v=baa9d230:7014
processDispatchQueueItemsInOrder @ chunk-WRD5HZVH.js?v=baa9d230:7034
processDispatchQueue @ chunk-WRD5HZVH.js?v=baa9d230:7043
dispatchEventsForPlugins @ chunk-WRD5HZVH.js?v=baa9d230:7051
(anonymous) @ chunk-WRD5HZVH.js?v=baa9d230:7174
batchedUpdates$1 @ chunk-WRD5HZVH.js?v=baa9d230:18913
batchedUpdates @ chunk-WRD5HZVH.js?v=baa9d230:3579
dispatchEventForPluginEventSystem @ chunk-WRD5HZVH.js?v=baa9d230:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-WRD5HZVH.js?v=baa9d230:5478
dispatchEvent @ chunk-WRD5HZVH.js?v=baa9d230:5472
dispatchDiscreteEvent @ chunk-WRD5HZVH.js?v=baa9d230:5449
GridLayoutCanvas.jsx:283 Error type: Error
generatePDF @ GridLayoutCanvas.jsx:283
await in generatePDF
callCallback2 @ chunk-WRD5HZVH.js?v=baa9d230:3674
invokeGuardedCallbackDev @ chunk-WRD5HZVH.js?v=baa9d230:3699
invokeGuardedCallback @ chunk-WRD5HZVH.js?v=baa9d230:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-WRD5HZVH.js?v=baa9d230:3736
executeDispatch @ chunk-WRD5HZVH.js?v=baa9d230:7014
processDispatchQueueItemsInOrder @ chunk-WRD5HZVH.js?v=baa9d230:7034
processDispatchQueue @ chunk-WRD5HZVH.js?v=baa9d230:7043
dispatchEventsForPlugins @ chunk-WRD5HZVH.js?v=baa9d230:7051
(anonymous) @ chunk-WRD5HZVH.js?v=baa9d230:7174
batchedUpdates$1 @ chunk-WRD5HZVH.js?v=baa9d230:18913
batchedUpdates @ chunk-WRD5HZVH.js?v=baa9d230:3579
dispatchEventForPluginEventSystem @ chunk-WRD5HZVH.js?v=baa9d230:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-WRD5HZVH.js?v=baa9d230:5478
dispatchEvent @ chunk-WRD5HZVH.js?v=baa9d230:5472
dispatchDiscreteEvent @ chunk-WRD5HZVH.js?v=baa9d230:5449
GridLayoutCanvas.jsx:284 Error message: Attempting to parse an unsupported color function "color"
generatePDF @ GridLayoutCanvas.jsx:284
await in generatePDF
callCallback2 @ chunk-WRD5HZVH.js?v=baa9d230:3674
invokeGuardedCallbackDev @ chunk-WRD5HZVH.js?v=baa9d230:3699
invokeGuardedCallback @ chunk-WRD5HZVH.js?v=baa9d230:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-WRD5HZVH.js?v=baa9d230:3736
executeDispatch @ chunk-WRD5HZVH.js?v=baa9d230:7014
processDispatchQueueItemsInOrder @ chunk-WRD5HZVH.js?v=baa9d230:7034
processDispatchQueue @ chunk-WRD5HZVH.js?v=baa9d230:7043
dispatchEventsForPlugins @ chunk-WRD5HZVH.js?v=baa9d230:7051
(anonymous) @ chunk-WRD5HZVH.js?v=baa9d230:7174
batchedUpdates$1 @ chunk-WRD5HZVH.js?v=baa9d230:18913
batchedUpdates @ chunk-WRD5HZVH.js?v=baa9d230:3579
dispatchEventForPluginEventSystem @ chunk-WRD5HZVH.js?v=baa9d230:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-WRD5HZVH.js?v=baa9d230:5478
dispatchEvent @ chunk-WRD5HZVH.js?v=baa9d230:5472
dispatchDiscreteEvent @ chunk-WRD5HZVH.js?v=baa9d230:5449
GridLayoutCanvas.jsx:285 Error stack: Error: Attempting to parse an unsupported color function "color"
    at Object.parse (http://localhost:5172/node_modules/.vite/deps/html2canvas.js?v=baa9d230:1672:15)
    at parseColorStop (http://localhost:5172/node_modules/.vite/deps/html2canvas.js?v=baa9d230:1969:24)
    at http://localhost:5172/node_modules/.vite/deps/html2canvas.js?v=baa9d230:2123:21
    at Array.forEach (<anonymous>)
    at linearGradient (http://localhost:5172/node_modules/.vite/deps/html2canvas.js?v=baa9d230:2112:29)
    at Object.parse (http://localhost:5172/node_modules/.vite/deps/html2canvas.js?v=baa9d230:2390:14)
    at http://localhost:5172/node_modules/.vite/deps/html2canvas.js?v=baa9d230:2427:20
    at Array.map (<anonymous>)
    at Object.parse (http://localhost:5172/node_modules/.vite/deps/html2canvas.js?v=baa9d230:2426:8)
    at parse (http://localhost:5172/node_modules/.vite/deps/html2canvas.js?v=baa9d230:3697:25)
generatePDF @ GridLayoutCanvas.jsx:285
await in generatePDF
callCallback2 @ chunk-WRD5HZVH.js?v=baa9d230:3674
invokeGuardedCallbackDev @ chunk-WRD5HZVH.js?v=baa9d230:3699
invokeGuardedCallback @ chunk-WRD5HZVH.js?v=baa9d230:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-WRD5HZVH.js?v=baa9d230:3736
executeDispatch @ chunk-WRD5HZVH.js?v=baa9d230:7014
processDispatchQueueItemsInOrder @ chunk-WRD5HZVH.js?v=baa9d230:7034
processDispatchQueue @ chunk-WRD5HZVH.js?v=baa9d230:7043
dispatchEventsForPlugins @ chunk-WRD5HZVH.js?v=baa9d230:7051
(anonymous) @ chunk-WRD5HZVH.js?v=baa9d230:7174
batchedUpdates$1 @ chunk-WRD5HZVH.js?v=baa9d230:18913
batchedUpdates @ chunk-WRD5HZVH.js?v=baa9d230:3579
dispatchEventForPluginEventSystem @ chunk-WRD5HZVH.js?v=baa9d230:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-WRD5HZVH.js?v=baa9d230:5478
dispatchEvent @ chunk-WRD5HZVH.js?v=baa9d230:5472
dispatchDiscreteEvent @ chunk-WRD5HZVH.js?v=baa9d230:5449
GridLayoutCanvas.jsx:286 Full error object: 
generatePDF @ GridLayoutCanvas.jsx:286
await in generatePDF
callCallback2 @ chunk-WRD5HZVH.js?v=baa9d230:3674
invokeGuardedCallbackDev @ chunk-WRD5HZVH.js?v=baa9d230:3699
invokeGuardedCallback @ chunk-WRD5HZVH.js?v=baa9d230:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-WRD5HZVH.js?v=baa9d230:3736
executeDispatch @ chunk-WRD5HZVH.js?v=baa9d230:7014
processDispatchQueueItemsInOrder @ chunk-WRD5HZVH.js?v=baa9d230:7034
processDispatchQueue @ chunk-WRD5HZVH.js?v=baa9d230:7043
dispatchEventsForPlugins @ chunk-WRD5HZVH.js?v=baa9d230:7051
(anonymous) @ chunk-WRD5HZVH.js?v=baa9d230:7174
batchedUpdates$1 @ chunk-WRD5HZVH.js?v=baa9d230:18913
batchedUpdates @ chunk-WRD5HZVH.js?v=baa9d230:3579
dispatchEventForPluginEventSystem @ chunk-WRD5HZVH.js?v=baa9d230:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-WRD5HZVH.js?v=baa9d230:5478
dispatchEvent @ chunk-WRD5HZVH.js?v=baa9d230:5472
dispatchDiscreteEvent @ chunk-WRD5HZVH.js?v=baa9d230:5449

*/