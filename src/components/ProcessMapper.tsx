import React, { useEffect, useRef, useState, useCallback } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import jsPDF from 'jspdf';
import { 
  Plus, 
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  Maximize,
  Type,
  Bold,
  Italic,
  Underline,
  AlignJustify,
  MousePointer,
  Square,
  CheckCircle,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  HelpCircle,
  Download,
  Settings,
  Sparkles
} from 'lucide-react';
import { processDiagramService, ProcessDiagram } from '../services/processDiagramService';
import { useAuth } from '../contexts/AuthContext';
import AICoachSidebar from './AICoachSidebar';
import ProcessDrafterModal from './ProcessDrafterModal';
import BuildGuidePanel from './BuildGuidePanel';
import DropdownMenu from './DropdownMenu';
import ProcessGuide from './ProcessGuide';

// CSS to hide BPMN.js watermark
const hideWatermarkCSS = `
  .bjs-powered-by {
    display: none !important;
  }
`;

interface ProcessMapperProps {
  onClose?: () => void;
}

const ProcessMapper: React.FC<ProcessMapperProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diagrams, setDiagrams] = useState<ProcessDiagram[]>([]);
  const [activeDiagramId, setActiveDiagramId] = useState<string>('');
  const [currentZoom, setCurrentZoom] = useState(100);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showSheetsDropdown, setShowSheetsDropdown] = useState(false);
  const [draggedDiagram, setDraggedDiagram] = useState<string | null>(null);
  
  // AI Coach state
  const [aiCoachEnabled, setAiCoachEnabled] = useState(false);
  const [aiCoachSidebarOpen, setAiCoachSidebarOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Process Drafter state
  const [processDrafterModalOpen, setProcessDrafterModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [buildGuideOpen, setBuildGuideOpen] = useState(false);
  const [buildGuide, setBuildGuide] = useState<string[]>([]);
  const [lanes, setLanes] = useState<string[]>([]);
  
  // Guide state
  const [guideEnabled, setGuideEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('process-mapper-guide-enabled') === 'true';
    }
    return false;
  });
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  
  // Inline editing state
  const [editingDiagramId, setEditingDiagramId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  // Process name state
  const [processName, setProcessName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('process-mapper-process-name') || '';
    }
    return '';
  });

  const { user } = useAuth();





  const loadUserDiagrams = async () => {
    if (!user) {
      console.log('❌ No user found, skipping diagram load');
      return;
    }
    
    try {
      console.log('🔍 Fetching user diagrams...');
      const userDiagrams = await processDiagramService.getUserDiagrams();
      console.log('📊 Found diagrams:', userDiagrams);
      setDiagrams(userDiagrams);
      
      if (userDiagrams.length > 0) {
        console.log('📋 Setting active diagram:', userDiagrams[0].id);
        setActiveDiagramId(userDiagrams[0].id);
        // Load the first diagram into the modeler
        console.log('📄 Loading diagram into modeler...');
        await switchDiagram(userDiagrams[0].id, userDiagrams);
      } else {
        console.log('📝 No diagrams found, creating initial diagram...');
        // Create initial diagram
        await createNewDiagram();
      }
    } catch (error) {
      console.error('❌ Error loading user diagrams:', error);
      // Create initial diagram if loading fails
      await createNewDiagram();
    }
  };

  const createNewDiagram = async () => {
    if (!modelerRef.current) {
      console.log('❌ No modeler available for creating new diagram');
      return;
    }
    
    // Prevent multiple simultaneous creations
    if (isLoading) {
      console.log('❌ Already creating diagram, please wait...');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Save current diagram before creating new one
      if (activeDiagramId) {
        console.log('💾 Saving current diagram before creating new one...');
        await saveCurrentDiagram();
      }
      
      console.log('📝 Creating new diagram...');
      // Create a simple empty diagram
      const emptyXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
      
      console.log('📄 Importing empty XML...');
      await modelerRef.current.importXML(emptyXML);
      console.log('✅ XML imported successfully');
      
      // Save the new diagram
      console.log('💾 Saving new diagram...');
      const { xml } = await modelerRef.current.saveXML({ format: true });
      const { svg } = await modelerRef.current.saveSVG();
      
      const newDiagram = await processDiagramService.saveDiagram({
        name: `Diagram ${diagrams.length + 1}`,
        xml_content: xml || '',
        svg_content: svg || ''
      });
      
      if (newDiagram) {
        console.log('✅ New diagram saved:', newDiagram);
        setDiagrams(prev => [...prev, newDiagram]);
        setActiveDiagramId(newDiagram.id);
      }
    } catch (error) {
      console.error('❌ Error creating new diagram:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize BPMN modeler
  useEffect(() => {
    if (!containerRef.current) {
      console.log('❌ Container ref not available');
      return;
    }

    console.log('🔧 Initializing BPMN modeler...');
    
        let modeler: any;
          try {
        modeler = new BpmnModeler({
          container: containerRef.current
        });
        

      


      console.log('✅ BPMN modeler created:', modeler);
      modelerRef.current = modeler;
      
      // Disable annoying modal popups but keep inline editing
      const eventBus = modeler.get('eventBus');
      if (eventBus) {
        // Allow direct editing but prevent modal popups
        eventBus.on('directEditing.activate', (event: any) => {
          // Allow the editing to happen but prevent modal behavior
          console.log('✏️ Inline editing activated');
        });
        
        // Disable context pad popups (right-click menus)
        eventBus.on('contextPad.open', (event: any) => {
          event.preventDefault();
          event.stopPropagation();
          return false;
        });
        
        // Disable popup menus
        eventBus.on('popupMenu.open', (event: any) => {
          event.preventDefault();
          event.stopPropagation();
          return false;
        });
        
        console.log('✅ Inline editing enabled, modals disabled');
      }
      

    } catch (error) {
      console.error('❌ Error creating BPMN modeler:', error);
      return;
    }

    // Auto-save on changes with debouncing
    let saveTimeout: NodeJS.Timeout;
    let isSaving = false;
    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        if (!isSaving) {
          console.log('📝 Auto-saving diagram...');
          isSaving = true;
          await saveCurrentDiagram();
          isSaving = false;
        }
      }, 1000); // Save after 1 second of inactivity
    };

    modeler.on('commandStack.changed', debouncedSave);
    modeler.on('element.changed', debouncedSave);

    // Debug palette events
    modeler.on('palette.getPaletteEntries', () => {
      console.log('🎨 Palette entries requested');
    });

    modeler.on('create.end', (event: any) => {
      console.log('➕ Element created:', event);
    });





    modeler.on('element.click', (event: any) => {
      console.log('🖱️ Element clicked:', event);
    });

    modeler.on('drag.start', (event: any) => {
      console.log('🖱️ Drag started:', event);
    });

    modeler.on('drag.end', (event: any) => {
      console.log('🖱️ Drag ended:', event);
    });

    // Handle element selection for multi-select mode
    modeler.on('element.click', (event: any) => {
      console.log('🖱️ Element clicked:', event);
      
      // Track selected element for debugging
      if (event.element) {
        console.log('📋 Element clicked:', event.element);
      }
      
      if (isMultiSelectMode && event.element) {
        const selection = modeler.get('selection') as any;
        if (selection) {
          const currentSelection = selection.get();
          if (currentSelection.includes(event.element)) {
            // Deselect if already selected
            selection.deselect(event.element);
          } else {
            // Add to selection by creating a new array
            const newSelection = [...currentSelection, event.element];
            selection.set(newSelection);
          }
        }
      }
    });

    // Add double-click handler for direct text editing
    modeler.on('element.dblclick', (event: any) => {
      console.log('🖱️ Element double-clicked:', event);
      if (event.element && event.element.businessObject) {
        const currentName = event.element.businessObject.name || 'Task';
        console.log('📝 Current element name:', currentName);
        console.log('📝 Element type:', event.element.type);
        console.log('📝 Element business object:', event.element.businessObject);
        
        const newName = prompt('Edit element text:', currentName);
        if (newName !== null && newName !== currentName) {
          const modeling = modeler.get('modeling') as any;
          if (modeling) {
            modeling.updateProperties(event.element, { name: newName });
            console.log('📝 Direct text edit applied:', newName);
            
            // Force a redraw to ensure text is visible
            try {
              const elementRegistry = modeler.get('elementRegistry') as any;
              const graphicsFactory = modeler.get('graphicsFactory') as any;
              if (elementRegistry && graphicsFactory) {
                const element = elementRegistry.get(event.element.id);
                if (element) {
                  graphicsFactory.update('shape', element, element);
                  console.log('📝 Forced redraw after text edit');
                }
              }
            } catch (error) {
              console.log('📝 Redraw error (non-critical):', error);
            }
          }
        }
      }
    });

    // Load user diagrams
    console.log('📂 Loading user diagrams...');
    loadUserDiagrams();
    
    // Test if modeler is working by trying to create a simple element
    setTimeout(() => {
      try {
        const canvas = modeler.get('canvas') as any;
        const elementFactory = modeler.get('elementFactory') as any;
        const modeling = modeler.get('modeling') as any;
        
        if (canvas && elementFactory && modeling) {
          console.log('✅ Modeler services are available');
          
          // Test if we can access the palette
          const palette = modeler.get('palette') as any;
          if (palette) {
            console.log('✅ Palette is available');
            console.log('🎨 Palette entries:', Object.keys(palette._entries || {}));
          } else {
            console.log('❌ Palette not available');
          }
        } else {
          console.log('❌ Modeler services not available');
        }
      } catch (error) {
        console.log('❌ Error testing modeler:', error);
      }
    }, 2000);
    

    
    // Add palette debugging
    modeler.on('palette.getPaletteEntries', () => {
      console.log('🎨 Palette entries requested');
    });
    
    modeler.on('create.start', (event: any) => {
      console.log('➕ Create started:', event);
    });
    
    modeler.on('create.end', (event: any) => {
      console.log('✅ Create ended:', event);
    });
    
    // Debug canvas events
    modeler.on('canvas.viewbox.changed', () => {
      console.log('🔍 Canvas viewbox changed');
    });

    return () => {
      if (modeler) {
        modeler.destroy();
      }
    };
  }, []);



  const switchDiagram = async (id: string, diagramsToSearch?: ProcessDiagram[]) => {
    if (!modelerRef.current) {
      console.log('❌ No modeler available for switching diagram');
      return;
    }
    
    // Save current diagram before switching
    if (activeDiagramId && activeDiagramId !== id) {
      console.log('💾 Saving current diagram before switching...');
      await saveCurrentDiagram();
    }
    
    const diagram = (diagramsToSearch || diagrams).find(d => d.id === id);
    if (!diagram) {
      console.log('❌ Diagram not found:', id);
      console.log('🔍 Available diagrams:', diagramsToSearch || diagrams);
      return;
    }
    
    console.log('🔄 Switching to diagram:', id);
    setActiveDiagramId(id);
    try {
      console.log('📄 Importing XML content...');
      console.log('📄 Diagram XML content length:', diagram.xml_content?.length);
      console.log('📄 Diagram XML preview:', diagram.xml_content?.substring(0, 200) + '...');
      await modelerRef.current.importXML(diagram.xml_content);
      console.log('✅ XML imported successfully');
      
      const canvas = modelerRef.current.get('canvas') as any;
      canvas.zoom('fit-viewport');
      console.log('🔍 Zoomed to fit viewport');
    } catch (error) {
      console.error('❌ Error switching diagram:', error);
    }
  };

  const deleteDiagram = async (id: string) => {
    // Prevent deleting the last diagram
    if (diagrams.length <= 1) {
      alert('Cannot delete the last diagram. Please create a new one first.');
      return;
    }
    

    
    try {
      console.log('🗑️ Attempting to delete diagram:', id);
      const success = await processDiagramService.deleteDiagram(id);
      console.log('🗑️ Delete result:', success);
      
      if (success) {
        const next = diagrams.filter(d => d.id !== id);
        console.log('🗑️ Updated diagrams list:', next.length, 'diagrams remaining');
        setDiagrams(next);
        
        if (activeDiagramId === id && next.length > 0) {
          console.log('🗑️ Switching to next diagram:', next[0].id);
          await switchDiagram(next[0].id);
        }
      } else {
        console.log('❌ Delete operation returned false');
      }
    } catch (error) {
      console.error('❌ Error deleting diagram:', error);
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingDiagramId(id);
    setEditingName(currentName);
  };

  const saveEditing = async () => {
    if (editingDiagramId && editingName.trim() && editingName.trim() !== diagrams.find(d => d.id === editingDiagramId)?.name) {
      await renameDiagram(editingDiagramId, editingName.trim());
    }
    setEditingDiagramId(null);
    setEditingName('');
  };

  const cancelEditing = () => {
    setEditingDiagramId(null);
    setEditingName('');
  };

  const renameDiagram = async (id: string, newName: string) => {
    try {
      const success = await processDiagramService.updateDiagram(id, { name: newName });
      if (success) {
        setDiagrams(prev => prev.map(d => 
          d.id === id ? { ...d, name: newName } : d
        ));
      }
    } catch (error) {
      console.error('Error renaming diagram:', error);
    }
  };

  // Drag and drop functions for reordering diagrams
  const handleDragStart = (e: React.DragEvent, diagramId: string) => {
    setDraggedDiagram(diagramId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDiagramId: string) => {
    e.preventDefault();
    if (!draggedDiagram || draggedDiagram === targetDiagramId) {
      setDraggedDiagram(null);
      return;
    }

    const draggedIndex = diagrams.findIndex(d => d.id === draggedDiagram);
    const targetIndex = diagrams.findIndex(d => d.id === targetDiagramId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedDiagram(null);
      return;
    }

    // Reorder diagrams
    const newDiagrams = [...diagrams];
    const [draggedItem] = newDiagrams.splice(draggedIndex, 1);
    newDiagrams.splice(targetIndex, 0, draggedItem);
    
    setDiagrams(newDiagrams);
    setDraggedDiagram(null);
  };

  const handleDragEnd = () => {
    setDraggedDiagram(null);
  };

  // AI Coach functions
  const checkMyMap = async () => {
    if (!modelerRef.current) return;
    
    setIsAnalyzing(true);
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      
      const response = await fetch('http://localhost:3001/api/process-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          xml, 
          context: { 
            project: 'General',
            mode: 'as-is'
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to analyze process');
      
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setAiCoachSidebarOpen(true);
      
    } catch (error) {
      console.error('Error checking map:', error);
      alert('Failed to analyze process. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const focusElement = (elementId: string) => {
    if (!modelerRef.current) return;
    
    const canvas = modelerRef.current.get('canvas') as any;
    const elementRegistry = modelerRef.current.get('elementRegistry') as any;
    const selection = modelerRef.current.get('selection') as any;
    
    const element = elementRegistry.get(elementId);
    if (element) {
      // Store current zoom before focusing
      const currentZoom = canvas.zoom();
      
      selection.select(element);
      canvas.scrollToElement(element);
      
      // Restore zoom after focusing
      canvas.zoom(currentZoom);
    }
  };

  const applyFix = (elementId: string, newLabel: string) => {
    if (!modelerRef.current) return;
    
    const modeling = modelerRef.current.get('modeling') as any;
    const elementRegistry = modelerRef.current.get('elementRegistry') as any;
    
    const element = elementRegistry.get(elementId);
    if (element) {
      modeling.setLabel(element, newLabel);
    }
  };

  // Process Drafter functions
  const generateFromText = async (prompt: string, mode: string, industry: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/process-drafter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode, industry })
      });
      
      if (!response.ok) throw new Error('Failed to generate process');
      
      const data = await response.json();
      
      // Load the generated BPMN
      if (data.bpmnXml && modelerRef.current) {
        await modelerRef.current.importXML(data.bpmnXml);
        const canvas = modelerRef.current.get('canvas') as any;
        canvas.zoom('fit-viewport');
      }
      
      // Set the build guide
      setBuildGuide(data.guide || []);
      setLanes(data.lanes || []);
      setBuildGuideOpen(true);
      setProcessDrafterModalOpen(false);
      
    } catch (error) {
      console.error('Error generating process:', error);
      alert('Failed to generate process. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyStep = (stepIndex: number) => {
    // This would apply the specific step to the diagram
    // For now, just highlight the step
    console.log('Applying step:', stepIndex);
  };

  const highlightElement = (elementId: string) => {
    focusElement(elementId);
  };

  // Guide functions
  const handleGuideStepChange = (step: number) => {
    // Store current zoom before changing step
    if (modelerRef.current) {
      const canvas = modelerRef.current.get('canvas') as any;
      const currentZoom = canvas.zoom();
      
      setCurrentGuideStep(step);
      
      // Restore zoom after step change
      setTimeout(() => {
        if (modelerRef.current) {
          const canvas = modelerRef.current.get('canvas') as any;
          canvas.zoom(currentZoom);
        }
      }, 0);
    } else {
      setCurrentGuideStep(step);
    }
  };

  const handleGuideComplete = () => {
    setShowGuide(false);
    setGuideEnabled(false);
    localStorage.setItem('process-mapper-guide-enabled', 'false');
  };

  const handleGuideClose = () => {
    setShowGuide(false);
    setGuideEnabled(false);
    localStorage.setItem('process-mapper-guide-enabled', 'false');
  };

  // Update localStorage when guide state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('process-mapper-guide-enabled', guideEnabled.toString());
    }
  }, [guideEnabled]);

  // Update localStorage when process name changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('process-mapper-process-name', processName);
    }
  }, [processName]);



  const saveCurrentDiagram = async () => {
    console.log('💾 saveCurrentDiagram called');
    console.log('💾 modelerRef.current:', !!modelerRef.current);
    console.log('💾 activeDiagramId:', activeDiagramId);
    
    if (!modelerRef.current || !activeDiagramId) {
      console.log('💾 Cannot save - missing modeler or activeDiagramId');
      return;
    }
    
    try {
      console.log('💾 Saving XML and SVG...');
      const { xml } = await modelerRef.current.saveXML({ format: true });
      const { svg } = await modelerRef.current.saveSVG();
      
      console.log('💾 XML length:', xml?.length);
      console.log('💾 SVG length:', svg?.length);
      
      console.log('💾 Calling updateDiagram...');
      const result = await processDiagramService.updateDiagram(activeDiagramId, {
        xml_content: xml,
        svg_content: svg
      });
      
      console.log('💾 Update result:', result);
      
      // Update local state with the updated diagram
      if (result && xml) {
        setDiagrams(prev => prev.map(d => 
          d.id === activeDiagramId ? { ...d, xml_content: xml, svg_content: svg || '' } : d
        ));
        console.log('💾 Local state updated with new content');
      }
      
      console.log('💾 Save completed successfully');
    } catch (error) {
      console.error('❌ Error saving diagram:', error);
    }
  };

  // Zoom functions
  const zoomIn = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas') as any;
    const currentZoom = canvas.zoom();
    const newZoom = currentZoom * 1.2;
    canvas.zoom(newZoom);
    setCurrentZoom(Math.round(newZoom * 100));
  };

  const zoomOut = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas') as any;
    const currentZoom = canvas.zoom();
    const newZoom = currentZoom / 1.2;
    canvas.zoom(newZoom);
    setCurrentZoom(Math.round(newZoom * 100));
  };

  const fitToView = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas') as any;
    canvas.zoom('fit-viewport');
    setCurrentZoom(100);
  };

  // Sync zoom state with actual canvas zoom
  useEffect(() => {
    if (modelerRef.current) {
      const canvas = modelerRef.current.get('canvas') as any;
      const actualZoom = canvas.zoom();
      setCurrentZoom(Math.round(actualZoom * 100));
    }
  }, []);

  // Export PDF
  const exportPDF = useCallback(async () => {
    if (!modelerRef.current) return;
    
    try {
      setIsLoading(true);
      
      // Get current canvas zoom level and viewport
      const bpmnCanvas = modelerRef.current.get('canvas') as any;
      const currentZoom = bpmnCanvas.zoom();
      const viewbox = bpmnCanvas.viewbox();
      
      // Export SVG with current zoom level
      const { svg } = await modelerRef.current.saveSVG();
      
      // Modify SVG to reflect current zoom level
      let modifiedSvg = svg;
      if (currentZoom !== 1) {
        // Add transform to scale the SVG based on current zoom with center origin
        modifiedSvg = svg.replace('<svg', `<svg style="transform: scale(${currentZoom}); transform-origin: center center;"`);
      }
      
      // Create canvas to render SVG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      const img = document.createElement('img') as HTMLImageElement;
      const svgBlob = new Blob([modifiedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            // Use A4 format with proper scaling (same as Export All Sheets)
            const pageWidth = 595.28;  // A4 width in points
            const pageHeight = 841.89; // A4 height in points
            const margin = 40;
            const contentWidth = pageWidth - (2 * margin);
            const contentHeight = pageHeight - (2 * margin);
            
            // Calculate scaling to fit on page
            const scaleX = contentWidth / img.width;
            const scaleY = contentHeight / img.height;
            const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
            
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            
            // Center the image on the page
            const x = margin + (contentWidth - scaledWidth) / 2;
            const y = margin + (contentHeight - scaledHeight) / 2;
            
            // Set canvas size
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
            
            canvas.toBlob(async (blob) => {
              if (!blob) {
                reject(new Error('Failed to create image blob'));
                return;
              }
              
              try {
                const pdf = new jsPDF({
                  orientation: 'portrait',
                  unit: 'pt',
                  format: 'a4'
                });
                
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = 40;
                const contentWidth = pageWidth - (2 * margin);
                const contentHeight = pageHeight - (2 * margin);
                
                // Recalculate scaling using PDF dimensions
                const scaleX = contentWidth / img.width;
                const scaleY = contentHeight / img.height;
                const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
                
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                
                // Center the image on the page
                const x = margin + (contentWidth - scaledWidth) / 2;
                const y = margin + (contentHeight - scaledHeight) / 2;
                
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const base64 = reader.result as string;
                    // Add process name and sheet name to PDF
                    const diagramName = diagrams.find(d => d.id === activeDiagramId)?.name || 'process-diagram';
                    
                    // Add headers to PDF
                    pdf.setFontSize(16);
                    pdf.setFont('helvetica', 'bold');
                    
                    // Add process name if available
                    if (processName && processName.trim()) {
                      pdf.text(`Process: ${processName}`, margin, 30);
                    }
                    
                    // Add page name
                    pdf.setFontSize(14);
                    pdf.text(`Page: ${diagramName}`, margin, 50);
                    
                    // Adjust image position to make room for headers
                    const adjustedY = y + 60;
                    pdf.addImage(base64, 'PNG', x, adjustedY, scaledWidth, scaledHeight);
                    
                    const fileName = `${diagramName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                    pdf.save(fileName);
                    
                    console.log('PDF exported successfully:', fileName);
                    resolve(fileName);
                  } catch (error) {
                    console.error('Error adding image to PDF:', error);
                    reject(new Error('Failed to add image to PDF'));
                  }
                };
                reader.readAsDataURL(blob);
              } catch (error) {
                console.error('Error creating PDF:', error);
                reject(new Error('Failed to create PDF'));
              }
            }, 'image/png', 0.9); // Add quality parameter
          } catch (error) {
            console.error('Error processing image:', error);
            reject(new Error('Failed to process image'));
          } finally {
            URL.revokeObjectURL(url);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG as image'));
        };
        
        img.src = url;
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [diagrams, activeDiagramId]);

  // Export All Sheets to PDF
  const exportAllSheetsPDF = useCallback(async () => {
    if (!modelerRef.current || diagrams.length <= 1) return;
    
    try {
      setIsLoading(true);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      
      let currentPage = 1;
      
      // Store the current active diagram ID
      const currentActiveId = activeDiagramId;
      
      // Process each diagram
      for (let i = 0; i < diagrams.length; i++) {
        const diagram = diagrams[i];
        
        // Switch to this diagram temporarily
        await switchDiagram(diagram.id);
        
        // Wait a bit for the diagram to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          // Get current canvas zoom level
          const bpmnCanvas = modelerRef.current!.get('canvas') as any;
          const currentZoom = bpmnCanvas.zoom();
          
          // Get SVG from BPMN modeler
          const { svg } = await modelerRef.current!.saveSVG();
          
          // Modify SVG to reflect current zoom level
          let modifiedSvg = svg;
          if (currentZoom !== 1) {
            // Add transform to scale the SVG based on current zoom with center origin
            modifiedSvg = svg.replace('<svg', `<svg style="transform: scale(${currentZoom}); transform-origin: center center;"`);
          }
          
          // Create an image from SVG
          const img = document.createElement('img') as HTMLImageElement;
          const svgBlob = new Blob([modifiedSvg], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          
          await new Promise<void>((resolve, reject) => {
            img.onload = async () => {
              try {
                // Create canvas for this diagram
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  reject(new Error('Could not get canvas context'));
                  return;
                }
                
                // Calculate scaling to fit on page
                const scaleX = contentWidth / img.width;
                const scaleY = contentHeight / img.height;
                const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
                
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                
                // Center the image on the page
                const x = margin + (contentWidth - scaledWidth) / 2;
                const y = margin + (contentHeight - scaledHeight) / 2;
                
                // Set canvas size
                canvas.width = scaledWidth;
                canvas.height = scaledHeight;
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                
                // Convert canvas to blob
                canvas.toBlob(async (blob) => {
                  if (!blob) {
                    reject(new Error('Failed to create image blob'));
                    return;
                  }
                  
                  try {
                    // Convert blob to base64
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const base64 = reader.result as string;
                        
                        // Add page number if not first page
                        if (currentPage > 1) {
                          pdf.addPage();
                        }
                        
                        // Add diagram title
                        pdf.setFontSize(16);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text(diagram.name, margin, margin - 20);
                        
                        // Add image to PDF
                        pdf.addImage(base64, 'PNG', x, y, scaledWidth, scaledHeight);
                        
                        currentPage++;
                        resolve();
                        
                      } catch (error) {
                        console.error('Error adding image to PDF:', error);
                        reject(new Error('Failed to add image to PDF'));
                      }
                    };
                    
                    reader.readAsDataURL(blob);
                    
                  } catch (error) {
                    console.error('Error creating PDF:', error);
                    reject(new Error('Failed to create PDF'));
                  }
                }, 'image/png');
                
              } catch (error) {
                console.error('Error processing image:', error);
                reject(new Error('Failed to process image'));
              } finally {
                URL.revokeObjectURL(url);
              }
            };
            
            img.onerror = () => {
              URL.revokeObjectURL(url);
              reject(new Error('Failed to load SVG as image'));
            };
            
            img.src = url;
          });
          
        } catch (error) {
          console.error(`Error processing diagram ${diagram.name}:`, error);
          // Continue with next diagram instead of failing completely
        }
      }
      
      // Switch back to original diagram
      await switchDiagram(currentActiveId);
      
      // Generate filename
      const fileName = `all_process_diagrams_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save PDF
      pdf.save(fileName);
      
      console.log('All sheets exported successfully:', fileName);
      
    } catch (error) {
      console.error('Error exporting all sheets to PDF:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeDiagramId, diagrams]);

  return (
    <div className="flex flex-col h-full bg-white">
      <style dangerouslySetInnerHTML={{ __html: hideWatermarkCSS }} />
      {/* Header */}
      <div id="pm-toolbar" className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <h1 className="text-base font-semibold text-gray-800">Process Mapper</h1>
          
          <button
            onClick={createNewDiagram}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            <Plus size={12} />
            <span>New Diagram</span>
          </button>

          {/* Zoom Controls - Individual Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={zoomOut}
              className="flex items-center justify-center w-8 h-8 rounded text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={12} />
            </button>
            
            <span className="text-xs text-gray-600 min-w-[32px] text-center px-1.5 py-0.5 bg-gray-100 rounded">
              {Math.round(currentZoom)}%
            </span>
            
            <button
              onClick={zoomIn}
              className="flex items-center justify-center w-8 h-8 rounded text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={12} />
            </button>
            
            <button
              onClick={fitToView}
              className="flex items-center justify-center w-8 h-8 rounded text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Fit to View"
            >
              <Maximize size={12} />
            </button>
            
            <button
              onClick={() => {
                setIsMultiSelectMode(!isMultiSelectMode);
                if (modelerRef.current) {
                  try {
                    const selection = modelerRef.current.get('selection') as any;
                    if (selection && selection.clear) {
                      selection.clear();
                    }
                  } catch (error) {
                    console.log('Could not clear selection:', error);
                  }
                }
              }}
              className={`flex items-center justify-center w-8 h-8 rounded text-xs transition-colors ${
                isMultiSelectMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title={isMultiSelectMode ? 'Exit Multi-Select' : 'Enter Multi-Select'}
            >
              <MousePointer size={12} />
            </button>
          </div>



          {/* Export & Save Dropdown */}
          <DropdownMenu
            label="Export & Save"
            icon={<Download size={12} />}
            items={[
              {
                id: 'export-pdf',
                label: isLoading ? 'Exporting...' : 'Export PDF',
                icon: <FileText size={12} />,
                onClick: exportPDF,
                disabled: isLoading
              },
              {
                id: 'export-all',
                label: 'Export All Sheets',
                icon: <FileText size={12} />,
                onClick: exportAllSheetsPDF,
                disabled: isLoading || diagrams.length <= 1
              },
              { id: 'divider-2', label: '', onClick: () => {}, divider: true },
              {
                id: 'save',
                label: 'Save',
                icon: <FileText size={12} />,
                onClick: saveCurrentDiagram
              }
            ]}
          />

          {/* AI Coach Toggle - Keep Visible */}
          <button
            onClick={() => setAiCoachEnabled(!aiCoachEnabled)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs transition-colors ${
              aiCoachEnabled 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Toggle AI Coach"
          >
            {aiCoachEnabled ? <ToggleRight size={11} /> : <ToggleLeft size={11} />}
            <span>AI Coach {aiCoachEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* AI Tools Dropdown */}
          <DropdownMenu
            label="AI Tools"
            icon={<Sparkles size={12} />}
            items={[
              {
                id: 'check-map',
                label: isAnalyzing ? 'Analyzing...' : 'Check My Map',
                icon: <CheckCircle size={12} />,
                onClick: checkMyMap,
                disabled: isAnalyzing || !aiCoachEnabled
              },
              {
                id: 'describe-process',
                label: 'Describe Process',
                icon: <MessageSquare size={12} />,
                onClick: () => setProcessDrafterModalOpen(true)
              }
            ]}
          />

          {/* Load Example Dropdown */}
          <DropdownMenu
            label="Load Example"
            icon={<FileText size={12} />}
            items={[
              {
                id: 'password-reset',
                label: 'Password Reset',
                icon: <FileText size={12} />,
                onClick: () => {
                  // Load password reset example
                  const exampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_Customer" name="Customer" processRef="Process_Customer" />
    <bpmn:participant id="Participant_App" name="App" processRef="Process_App" />
    <bpmn:startEvent id="StartEvent_1" name="User clicks Forgot Password">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Enter email address">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_2" name="Generate reset token">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_3" name="Send reset link">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_1" name="Is token valid?">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_4" name="Allow password entry">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_5" name="Set new password">
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="User signs in">
      <bpmn:incoming>Flow_8</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:task id="Task_6" name="Show error and lock after 3 attempts">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_9</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_2" name="Account locked">
      <bpmn:incoming>Flow_9</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Task_2" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_2" targetRef="Task_3" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_3" targetRef="Gateway_1" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Gateway_1" targetRef="Task_4" name="Yes" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Gateway_1" targetRef="Task_6" name="No" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_4" targetRef="Task_5" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Task_5" targetRef="EndEvent_1" />
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Task_6" targetRef="EndEvent_2" />
  </bpmn:collaboration>
  <bpmn:process id="Process_Customer" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
    <bpmn:task id="Task_1" />
    <bpmn:task id="Task_5" />
  </bpmn:process>
  <bpmn:process id="Process_App" isExecutable="false">
    <bpmn:task id="Task_2" />
    <bpmn:task id="Task_3" />
    <bpmn:exclusiveGateway id="Gateway_1" />
    <bpmn:task id="Task_4" />
    <bpmn:task id="Task_6" />
    <bpmn:endEvent id="EndEvent_1" />
    <bpmn:endEvent id="EndEvent_2" />
  </bpmn:process>
</bpmn:definitions>`;
                  
                  if (modelerRef.current) {
                    modelerRef.current.importXML(exampleXml).then(() => {
                      const canvas = modelerRef.current?.get('canvas') as any;
                      if (canvas) {
                        canvas.zoom('fit-viewport');
                      }
                    });
                  }
                }
              }
            ]}
          />

          {/* Help Guide Toggle */}
          <button
            onClick={() => {
              setGuideEnabled(!guideEnabled);
              if (!guideEnabled) {
                setShowGuide(true);
                setCurrentGuideStep(0);
              } else {
                setShowGuide(false);
              }
            }}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs transition-colors ${
              guideEnabled 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Toggle Step-by-Step Guide"
          >
            <HelpCircle size={11} />
            <span>Help {guideEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Close"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* BPMN Editor */}
      <div className="flex-1 relative">
        {/* Process Name Field - Top Left */}
        <div className="absolute -top-4 left-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-1">
            <input
              type="text"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="Process Name (optional)"
                              className="text-sm font-bold bg-transparent border-none outline-none placeholder-gray-400 text-gray-900 w-auto"
            />
          </div>
        </div>
        
        <div 
          id="pm-canvas"
          ref={containerRef} 
          className="w-full h-full"
          style={{ 
            position: 'relative',
            zIndex: 1
          }}
          onLoad={() => console.log('🎨 BPMN container loaded')}
        />
        
        {/* Hidden palette reference for guide */}
        <div id="pm-palette" className="hidden" />
        

        

        
        {/* Bottom-left Sheets Controls */}
        <div className="absolute left-4 bottom-4 flex items-start z-50">
          <div className="flex items-center bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-1">
            {diagrams.map((d, index) => (
              <div
                key={d.id}
                draggable
                className={`flex items-center space-x-2 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                  d.id === activeDiagramId 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${draggedDiagram === d.id ? 'opacity-50' : ''} ${index > 0 ? 'ml-1' : ''}`}
                onClick={() => switchDiagram(d.id)}
                onDragStart={(e) => handleDragStart(e, d.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, d.id)}
                onDragEnd={handleDragEnd}
                title={`${d.name} (drag to reorder)`}
              >
                {editingDiagramId === d.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={saveEditing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveEditing();
                      } else if (e.key === 'Escape') {
                        cancelEditing();
                      }
                    }}
                    className="text-sm font-medium bg-white border border-blue-300 rounded px-1 py-0.5 w-[120px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span 
                    className="text-sm font-medium truncate max-w-[120px] cursor-text"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditing(d.id, d.name);
                    }}
                  >
                    {d.name}
                  </span>
                )}
                <button
                  className="p-1 rounded hover:bg-black/10 transition-colors"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    deleteDiagram(d.id); 
                  }}
                  title="Delete page"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button 
              onClick={createNewDiagram}
              disabled={isLoading}
              className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isLoading ? "Creating..." : "New Sheet"}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* AI Coach Sidebar */}
      <AICoachSidebar
        isOpen={aiCoachSidebarOpen}
        onClose={() => setAiCoachSidebarOpen(false)}
        suggestions={suggestions}
        onFocusElement={focusElement}
        onApplyFix={applyFix}
        isLoading={isAnalyzing}
      />

      {/* Process Drafter Modal */}
      <ProcessDrafterModal
        isOpen={processDrafterModalOpen}
        onClose={() => setProcessDrafterModalOpen(false)}
        onGenerate={generateFromText}
        isLoading={isGenerating}
      />

      {/* Build Guide Panel */}
      <BuildGuidePanel
        isOpen={buildGuideOpen}
        onClose={() => setBuildGuideOpen(false)}
        guide={buildGuide}
        lanes={lanes}
        onRegenerate={() => {
          // This would regenerate the guide
          console.log('Regenerating guide...');
        }}
        onApplyStep={applyStep}
        onHighlightElement={highlightElement}
        isLoading={isGenerating}
      />

      {/* Process Guide */}
      <ProcessGuide
        isOpen={showGuide}
        onClose={handleGuideClose}
        currentStep={currentGuideStep}
        onStepChange={handleGuideStepChange}
        onComplete={handleGuideComplete}
      />
    </div>
  );
};

export default ProcessMapper;
