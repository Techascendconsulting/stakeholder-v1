import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GenerateMapModal from '../Common/GenerateMapModal';
import { supabaseDiagramStorage } from '../../utils/supabaseDiagramStorage';
import { supabase } from '../../lib/supabase';
import BpmnModeler from 'bpmn-js/lib/Modeler';

export default function AIProcessMapperView() {
  const { setCurrentView, selectedProject } = useApp();
  const { user } = useAuth();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedMap, setGeneratedMap] = useState(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const modelerRef = useRef(null);
  const containerRef = useRef(null);

  // Convert AI-generated map to BPMN XML
  const generateBPMNXML = (mapData: any) => {
    const { nodes, connections } = mapData;
    
    // Generate unique IDs for BPMN elements
    const generateId = (prefix: string, index: number) => `${prefix}_${index}`;
    
    // Create BPMN XML structure
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">`;

    // Add nodes
    nodes.forEach((node: any, index: number) => {
      const bpmnId = generateId('Element', index + 1);
      const x = 100 + (index * 200);
      const y = 100;
      
      switch (node.type) {
        case 'start':
          xml += `\n    <bpmn:startEvent id="${bpmnId}" name="${node.label}"/>`;
          break;
        case 'end':
          xml += `\n    <bpmn:endEvent id="${bpmnId}" name="${node.label}"/>`;
          break;
        case 'decision':
          xml += `\n    <bpmn:exclusiveGateway id="${bpmnId}" name="${node.label}"/>`;
          break;
        case 'activity':
          xml += `\n    <bpmn:task id="${bpmnId}" name="${node.label}"/>`;
          break;
        default:
          xml += `\n    <bpmn:task id="${bpmnId}" name="${node.label}"/>`;
      }
    });

    // Add connections (sequence flows)
    connections.forEach((conn: any, index: number) => {
      const flowId = generateId('Flow', index + 1);
      const sourceId = generateId('Element', nodes.findIndex((n: any) => n.id === conn.from) + 1);
      const targetId = generateId('Element', nodes.findIndex((n: any) => n.id === conn.to) + 1);
      
      if (conn.condition) {
        xml += `\n    <bpmn:sequenceFlow id="${flowId}" sourceRef="${sourceId}" targetRef="${targetId}">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${conn.condition}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>`;
      } else {
        xml += `\n    <bpmn:sequenceFlow id="${flowId}" sourceRef="${sourceId}" targetRef="${targetId}"/>`;
      }
    });

    xml += `\n  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">`;

    // Add visual elements
    nodes.forEach((node: any, index: number) => {
      const bpmnId = generateId('Element', index + 1);
      const x = 100 + (index * 200);
      const y = 100;
      const width = node.type === 'decision' ? 50 : 100;
      const height = node.type === 'decision' ? 50 : 80;
      
      xml += `\n      <bpmndi:BPMNShape id="${bpmnId}_di" bpmnElement="${bpmnId}">
        <dc:Bounds x="${x}" y="${y}" width="${width}" height="${height}"/>
      </bpmndi:BPMNShape>`;
    });

    // Add visual connections
    connections.forEach((conn: any, index: number) => {
      const flowId = generateId('Flow', index + 1);
      xml += `\n      <bpmndi:BPMNEdge id="${flowId}_di" bpmnElement="${flowId}"/>`;
    });

    xml += `\n    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    return xml;
  };

  // Initialize BPMN modeler
  const initializeModeler = () => {
    if (!containerRef.current || modelerRef.current) return;
    
    const modeler = new BpmnModeler({
      container: containerRef.current,
      additionalModules: [],
      moddleExtensions: {}
    });

    modelerRef.current = modeler;
    
    // Set up event listeners
    modeler.on('import.done', (event: any) => {
      if (event.error) {
        console.error('BPMN import error:', event.error);
        setIsLoadingMap(false);
      } else {
        console.log('BPMN diagram imported successfully');
        setIsLoadingMap(false);
        // Auto-fit the diagram
        const canvas = modeler.get('canvas');
        canvas.zoom('fit-viewport');
      }
    });
  };

  // Load BPMN XML into modeler
  const loadBPMNXML = async (xml: string) => {
    if (!modelerRef.current) return;
    
    try {
      setIsLoadingMap(true);
      await modelerRef.current.importXML(xml);
    } catch (error) {
      console.error('Error loading BPMN XML:', error);
      setIsLoadingMap(false);
    }
  };

  // Convert AI-generated map to BPMN format and save it
  const handleGeneratedMap = async (mapData: any) => {
    try {
      console.log('🤖 AIProcessMapperView: Processing generated map:', mapData);
      
      // Store the map data for immediate display
      setGeneratedMap(mapData);
      
      // Generate BPMN XML
      const bpmnXML = generateBPMNXML(mapData);
      
      // Initialize modeler if not already done
      if (!modelerRef.current) {
        initializeModeler();
      }
      
      // Load the BPMN XML
      await loadBPMNXML(bpmnXML);
      
      if (!user?.id) {
        console.error('❌ No user ID available');
        return;
      }

      if (!selectedProject) {
        console.error('❌ No project selected');
        return;
      }

      // Generate a new diagram ID
      const diagramId = crypto.randomUUID();
      
      // Convert AI map format to BPMN-like format that ProcessMapper expects
      const bpmnData = convertAIMapToBPMN(mapData);
      
      // Save the diagram to Supabase
      const { error } = await supabase
        .from('process_diagrams')
        .insert({
          id: diagramId,
          user_id: user.id,
          project_id: selectedProject.id,
          name: `AI Generated Process - ${new Date().toLocaleDateString()}`,
          data: bpmnData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error saving diagram:', error);
        return;
      }

      console.log('✅ Diagram saved successfully with ID:', diagramId);
      
      // Store the diagram ID in sessionStorage so ProcessMapperView can load it if user wants to edit
      sessionStorage.setItem('selectedDiagramId', diagramId);
      
    } catch (error) {
      console.error('❌ Error handling generated map:', error);
    }
  };

  // Clear the generated map
  const clearGeneratedMap = () => {
    setGeneratedMap(null);
    if (modelerRef.current) {
      modelerRef.current.destroy();
      modelerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }
    };
  }, []);

  // Convert AI map format to BPMN-like format
  const convertAIMapToBPMN = (aiMap: any) => {
    const bpmnElements: any[] = [];
    const bpmnConnections: any[] = [];

    // Convert nodes to BPMN elements
    if (aiMap.nodes) {
      aiMap.nodes.forEach((node: any) => {
        const element: any = {
          id: node.id,
          type: getBPMNType(node.type),
          position: { x: 100, y: 100 }, // Default position, will be auto-arranged
          size: { width: 120, height: 60 },
          data: { label: node.label }
        };
        
        // Set specific properties based on type
        if (node.type === 'start') {
          element.position = { x: 100, y: 200 };
          element.size = { width: 100, height: 60 };
        } else if (node.type === 'end') {
          element.position = { x: 800, y: 200 };
          element.size = { width: 100, height: 60 };
        } else if (node.type === 'decision') {
          element.position = { x: 400, y: 200 };
          element.size = { width: 120, height: 80 };
        } else {
          // Activity
          element.position = { x: 300, y: 200 };
          element.size = { width: 150, height: 60 };
        }
        
        bpmnElements.push(element);
      });
    }

    // Convert connections to BPMN edges
    if (aiMap.connections) {
      aiMap.connections.forEach((conn: any, index: number) => {
        const edge = {
          id: `edge-${index}`,
          source: conn.from,
          target: conn.to,
          type: 'default',
          data: conn.condition ? { label: conn.condition } : {}
        };
        bpmnConnections.push(edge);
      });
    }

    return {
      elements: bpmnElements,
      connections: bpmnConnections
    };
  };

  // Map AI types to BPMN types
  const getBPMNType = (aiType: string) => {
    switch (aiType) {
      case 'start': return 'startEvent';
      case 'end': return 'endEvent';
      case 'decision': return 'exclusiveGateway';
      case 'activity': return 'task';
      default: return 'task';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI Process Mapper
            </h1>
            <p className="text-xl text-white/90 max-w-3xl">
              Describe a business process in plain English, and let AI instantly create your process map.
            </p>
          </div>

          {/* Generated Map Display */}
          {generatedMap && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Generated Process Map
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentView('process-mapper-editor')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit in Full Editor
                  </button>
                  <button
                    onClick={clearGeneratedMap}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Map
                  </button>
                </div>
              </div>
              
              {/* BPMN Viewer Container */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div 
                  ref={containerRef}
                  className="w-full h-96 rounded-lg"
                  style={{ minHeight: '400px' }}
                />
                {isLoadingMap && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600 dark:text-gray-400">Loading process map...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  <strong>Tip:</strong> Your process map has been automatically saved. Click "Edit in Full Editor" to make detailed changes, or "Clear Map" to generate a new one.
                </p>
              </div>
            </div>
          )}

          {/* Content - Only show if no map generated */}
          {!generatedMap && (
            <div className="p-8 space-y-8">
            {/* Top Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </button>
              <button
                onClick={() => setCurrentView('process-mapper')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Browse Saved Maps
              </button>
            </div>

            {/* Sample Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Start New Map */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">Start New Map</h3>
                </div>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Describe any business process in plain English and watch AI create a structured process map instantly.
                </p>
                <button 
                  onClick={() => setShowGenerateModal(true)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Generate with AI
                </button>
              </div>

              {/* View Sample Maps */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">View Sample Maps</h3>
                </div>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Explore existing process maps and see examples of how AI can structure different business processes.
                </p>
                <button 
                  onClick={() => setCurrentView('process-mapper')}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse Existing Maps
                </button>
              </div>
            </div>

            {/* How It Works Section */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  Our AI Process Mapper uses advanced natural language processing to understand your process description and automatically create a structured map with:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Simple Elements</h3>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                      <li>• Start and End points</li>
                      <li>• Activities and actions</li>
                      <li>• Decision points</li>
                      <li>• Clear connections</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Smart Processing</h3>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                      <li>• Understands natural language</li>
                      <li>• Identifies key steps</li>
                      <li>• Recognizes decision points</li>
                      <li>• Creates logical flow</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Example Section */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Example</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">Input:</h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4 italic">
                  "When a tenant submits a complaint, the Tenant Services team logs it into the system. Then they decide if it's about maintenance, billing, or communication. If it's maintenance, they send it to the contractor. If it's billing, they send it to Finance. If it's communication, they send it to Customer Experience. Each team investigates and resolves the issue, then closes it and feeds back to the tenant."
                </p>
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">AI Output:</h3>
                <p className="text-blue-700 dark:text-blue-300">
                  A structured process map with clear start/end points, decision diamonds, and activity rectangles showing the complete workflow.
                </p>
              </div>
            </section>
            </div>
          )}
        </div>
      </div>

      {/* Generate Map Modal */}
      {showGenerateModal && (
        <GenerateMapModal
          onClose={() => setShowGenerateModal(false)}
          onGenerate={(mapData) => {
            handleGeneratedMap(mapData);
            setShowGenerateModal(false);
          }}
        />
      )}
    </div>
  );
}
