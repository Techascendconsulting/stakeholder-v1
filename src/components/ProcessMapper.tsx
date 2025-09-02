import React from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';



const DEFAULT_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="160" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

import type { DiagramRecord, DiagramStorage } from '../utils/supabaseDiagramStorage';

type Props = {
  projectId: string;
  diagramId: string;
  storage: DiagramStorage;
  onBack?: () => void;
  title?: string;
};

export default function ProcessMapper({ projectId, diagramId, storage, onBack, title = 'As-Is Process Map' }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const modelerRef = React.useRef<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [dirty, setDirty] = React.useState(false);
  const [zoom, setZoom] = React.useState<number>(1);
  const [status, setStatus] = React.useState<string>('');
  const initedRef = React.useRef(false);

  const updateStatus = React.useCallback((msg: string) => {
    setStatus(msg);
    console.log('ProcessMapper:', msg);
  }, []);

  const ensureModeler = React.useCallback(() => {
    if (modelerRef.current) return modelerRef.current;
    
    const container = containerRef.current;
    if (!container) throw new Error('Container not ready');
    
    const modeler = new BpmnModeler({
      container
    });
    
    modelerRef.current = modeler;
    
    // Track changes for dirty state - try multiple approaches
    const commandStack = modeler.get('commandStack') as any;
    if (commandStack && typeof commandStack.on === 'function') {
      commandStack.on('changed', () => {
        setDirty(true);
      });
    } else if (commandStack && typeof commandStack.addListener === 'function') {
      commandStack.addListener('changed', () => {
        setDirty(true);
      });
    }
    
    // Handle import success/failure
    const eventBus = modeler.get('eventBus') as any;
    if (eventBus && typeof eventBus.on === 'function') {
      eventBus.on('import.done', (event: any) => {
        if (event.error) {
          updateStatus('Import failed: ' + event.error.message);
          setLoading(false);
        } else {
          updateStatus('Diagram loaded successfully');
          setLoading(false);
          // Auto-fit the diagram
          const canvas = modeler.get('canvas') as any;
          canvas.zoom('fit-viewport');
          setZoom(canvas.zoom());
        }
      });
    } else if (eventBus && typeof eventBus.addListener === 'function') {
      eventBus.addListener('import.done', (event: any) => {
        if (event.error) {
          updateStatus('Import failed: ' + event.error.message);
          setLoading(false);
        } else {
          updateStatus('Diagram loaded successfully');
          setLoading(false);
          // Auto-fit the diagram
          const canvas = modeler.get('canvas') as any;
          canvas.zoom('fit-viewport');
          setZoom(canvas.zoom());
        }
      });
    }
    
    // Fallback: manually set loading to false after a short delay
    setTimeout(() => {
      setLoading(false);
      updateStatus('Diagram loaded (fallback)');
    }, 1000);
    
    return modeler;
  }, [updateStatus]);

  const importXml = React.useCallback(async (xml: string) => {
    try {
      const modeler = ensureModeler();
      await modeler.importXML(xml);
    } catch (error) {
      console.error('Import error:', error);
      updateStatus('Import failed: ' + (error as Error).message);
      setLoading(false);
    }
  }, [ensureModeler, updateStatus]);

  const createNew = React.useCallback(async () => {
    setLoading(true);
    setDirty(false);
    await importXml(DEFAULT_BPMN_XML);
  }, [importXml]);

  const handleLoad = React.useCallback(async () => {
    try {
      setLoading(true);
      const existing = await storage.load(projectId, diagramId);
      if (existing?.xml) {
        await importXml(existing.xml);
      } else {
        await createNew();
      }
    } catch (error) {
      console.error('Load error:', error);
      updateStatus('Load failed: ' + (error as Error).message);
      await createNew();
    }
  }, [storage, projectId, diagramId, importXml, createNew, updateStatus]);

  const save = React.useCallback(async () => {
    try {
      const modeler = ensureModeler();
      const xml = await modeler.saveXML({ format: true });
      const svg = await modeler.saveSVG();
      
      const record: DiagramRecord = {
        id: diagramId,
        projectId,
        name: title,
        xml: xml.xml,
        svg: svg.svg,
        updatedAt: new Date().toISOString()
      };
      
      await storage.save(record);
      setDirty(false);
      updateStatus('Saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      updateStatus('Save failed: ' + (error as Error).message);
    }
  }, [ensureModeler, diagramId, projectId, title, storage, updateStatus]);

  const exportSVG = React.useCallback(async () => {
    try {
      const modeler = ensureModeler();
      const svg = await modeler.saveSVG();
      triggerDownload(svg.svg, 'diagram.svg', 'image/svg+xml');
    } catch (error) {
      console.error('Export SVG error:', error);
      updateStatus('Export failed: ' + (error as Error).message);
    }
  }, [ensureModeler, updateStatus]);

  const exportPNG = React.useCallback(async () => {
    try {
      const modeler = ensureModeler();
      const svg = await modeler.saveSVG();
      const pngBlob = await svgToPng(svg.svg);
      triggerDownload(pngBlob, 'diagram.png', 'image/png');
    } catch (error) {
      console.error('Export PNG error:', error);
      updateStatus('Export failed: ' + (error as Error).message);
    }
  }, [ensureModeler, updateStatus]);

  const zoomIn = React.useCallback(() => {
    const modeler = ensureModeler();
    const canvas = modeler.get('canvas') as any;
    canvas.zoom(canvas.zoom() * 1.2);
    setZoom(canvas.zoom());
  }, [ensureModeler]);

  const zoomOut = React.useCallback(() => {
    const modeler = ensureModeler();
    const canvas = modeler.get('canvas') as any;
    canvas.zoom(canvas.zoom() / 1.2);
    setZoom(canvas.zoom());
  }, [ensureModeler]);

  const zoomFit = React.useCallback(() => {
    const modeler = ensureModeler();
    const canvas = modeler.get('canvas') as any;
    canvas.zoom('fit-viewport');
    setZoom(canvas.zoom());
  }, [ensureModeler]);

  const zoomReset = React.useCallback(() => {
    const modeler = ensureModeler();
    const canvas = modeler.get('canvas') as any;
    setZoom(1);
  }, [ensureModeler]);

  const undo = React.useCallback(() => {
    const modeler = ensureModeler();
    const commandStack = modeler.get('commandStack') as any;
    if (commandStack.canUndo()) {
      commandStack.undo();
    }
  }, [ensureModeler]);

  const redo = React.useCallback(() => {
    const modeler = ensureModeler();
    const commandStack = modeler.get('commandStack') as any;
    if (commandStack.canRedo()) {
      commandStack.redo();
    }
  }, [ensureModeler]);

  React.useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    ensureModeler();
    handleLoad();
    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
        modelerRef.current = null;
      }
    };
  }, [ensureModeler, handleLoad]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onBack) {
        onBack();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onBack, save]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">Project: {projectId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={createNew}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            New Diagram
          </button>
          <button
            onClick={save}
            disabled={!dirty}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dirty 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {dirty ? 'Save*' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={redo}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <button
            onClick={zoomOut}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <span className="text-sm text-gray-600 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={zoomIn}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
          <button
            onClick={zoomFit}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Fit to View"
          >
            Fit
          </button>
          <button
            onClick={zoomReset}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="100%"
          >
            100%
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportSVG}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Export SVG
          </button>
          <button
            onClick={exportPNG}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Export PNG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading diagram...</span>
            </div>
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {/* Footer / Status */}
      <div className="flex items-center justify-between border-t bg-white px-4 py-2 text-sm text-gray-600">
        <div>{status}</div>
        <div>Diagram: <span className="font-mono">{diagramId}</span></div>
      </div>
    </div>
  );
}

// Utility functions
function triggerDownload(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function svgToPng(svgString: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      const { width, height } = getSvgViewBox(svgString);
      canvas.width = width;
      canvas.height = height;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      }, 'image/png');
    };
    
    img.onerror = () => reject(new Error('Failed to load SVG image'));
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  });
}

function getSvgViewBox(svgString: string): { width: number; height: number } {
  const match = svgString.match(/viewBox="([^"]+)"/);
  if (match) {
    const [, viewBox] = match;
    const [, , width, height] = viewBox.split(' ').map(Number);
    return { width, height };
  }
  return { width: 800, height: 600 }; // Default fallback
}
