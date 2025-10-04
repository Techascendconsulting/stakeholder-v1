import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GenerateMapModal from '../Common/GenerateMapModal';
import ClarificationModal from '../Common/ClarificationModal';
import { supabaseDiagramStorage } from '../../utils/supabaseDiagramStorage';
import { supabase } from '../../lib/supabase';
import AIService from '../../services/aiService';
import { v4 as uuidv4 } from 'uuid';
import BpmnModeler from 'bpmn-js/lib/Modeler';

export default function AIProcessMapperView() {
  const { setCurrentView, selectedProject } = useApp();
  const { user } = useAuth();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedMap, setGeneratedMap] = useState(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [bpmnModelerFailed, setBpmnModelerFailed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedId, setLastSavedId] = useState(null);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationRequest, setClarificationRequest] = useState(null);
  const [isProcessingClarification, setIsProcessingClarification] = useState(false);
  const [cachedClarifications, setCachedClarifications] = useState(new Map());
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToast] = useState(false);
  const modelerRef = useRef(null);
  const containerRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Toast notification function
  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto-hide toast after 4 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // Save map to Supabase function
  const saveMapToSupabase = async (mapData: any, xmlContent: string) => {
    if (!user || !selectedProject) return;
    
    try {
      setSaveStatus('saving');
      
      const saveData = {
        id: uuidv4(),
        user_id: user.id,
        project_id: selectedProject?.id || 'default',
        name: `AI Generated Process Map - ${new Date().toLocaleDateString()}`,
        xml: xmlContent
      };

      // Use existing save logic or create new entry
      if (lastSavedId) {
        const { data, error } = await supabase
          .from('process_diagrams')
          .update(saveData)
          .eq('id', lastSavedId)
          .select('*');
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('process_diagrams')
          .insert(saveData)
          .select('*');
        
        if (error) throw error;
        setLastSavedId(data[0]?.id);
      }
      
      setSaveStatus('saved');
      console.log('✅ Map saved to Supabase successfully');
      
    } catch (error) {
      console.error('❌ Error saving map to Supabase:', error);
      setSaveStatus('error');
      displayToast('⚠️ Failed to save map. Please try again.', 'error');
    }
  };

  // Convert AI-generated map to BPMN XML with proper structure
  const generateBPMNXML = (mapData: any) => {
    const { lanes, nodes, connections } = mapData;
    
    console.log('🔧 Generating BPMN XML with lanes:', lanes, 'nodes:', nodes, 'connections:', connections);
    
    // Validate input data
    if (!nodes || nodes.length === 0) {
      console.error('❌ No nodes provided for BPMN generation');
      return createMinimalBPMN();
    }

    // Create complete BPMN XML with diagram information
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">

  <bpmn:process id="Process_1" isExecutable="false">`;

    // Track nodes for diagram positioning
    const nodePositions: { [key: string]: { x: number, y: number, width: number, height: number } } = {};
    let currentX = 100;
    let currentY = 100;
    const nodeSpacing = 200;

    // Add nodes with proper flow references
    const nodeFlows: { [key: string]: string[] } = {};
    
    nodes.forEach((node: any, index: number) => {
      const bpmnId = `node_${node.id}`;
      const outgoingFlows: string[] = [];
      
      // Find outgoing connections
      const outgoingConnections = connections.filter((conn: any) => conn.from === node.id);
      outgoingConnections.forEach((conn: any, flowIndex: number) => {
        const flowId = `Flow_${conn.from}_to_${conn.to}`;
        outgoingFlows.push(flowId);
      });
      
      nodeFlows[bpmnId] = outgoingFlows;
      
      // Set node dimensions based on type
      let width = 100, height = 80;
      if (node.type === 'start' || node.type === 'end') {
        width = 36; height = 36;
      } else if (node.type === 'decision') {
        width = 50; height = 50;
      }
      
      // Store position for diagram
      nodePositions[bpmnId] = { x: currentX, y: currentY, width, height };
      
      switch (node.type) {
        case 'start':
          xml += `\n    <bpmn:startEvent id="${bpmnId}" name="${node.label || 'Start'}">`;
          outgoingFlows.forEach(flowId => {
            xml += `\n      <bpmn:outgoing>${flowId}</bpmn:outgoing>`;
          });
          xml += `\n    </bpmn:startEvent>`;
          break;
          
        case 'end':
          xml += `\n    <bpmn:endEvent id="${bpmnId}" name="${node.label || 'End'}">`;
          xml += `\n    </bpmn:endEvent>`;
          break;
          
        case 'decision':
          xml += `\n    <bpmn:exclusiveGateway id="${bpmnId}" name="${node.label || 'Decision'}">`;
          outgoingFlows.forEach(flowId => {
            xml += `\n      <bpmn:outgoing>${flowId}</bpmn:outgoing>`;
          });
          xml += `\n    </bpmn:exclusiveGateway>`;
          break;
          
        default:
          xml += `\n    <bpmn:task id="${bpmnId}" name="${node.label || 'Task'}">`;
          outgoingFlows.forEach(flowId => {
            xml += `\n      <bpmn:outgoing>${flowId}</bpmn:outgoing>`;
          });
          xml += `\n    </bpmn:task>`;
      }
      
      // Move to next position
      currentX += nodeSpacing;
    });

    // Add sequence flows
    if (connections && connections.length > 0) {
      connections.forEach((conn: any) => {
        const flowId = `Flow_${conn.from}_to_${conn.to}`;
        const sourceRef = `node_${conn.from}`;
        const targetRef = `node_${conn.to}`;
        const condition = conn.condition ? ` name="${conn.condition}"` : '';
        
        xml += `\n    <bpmn:sequenceFlow id="${flowId}" sourceRef="${sourceRef}" targetRef="${targetRef}"${condition} />`;
      });
    }

    xml += `\n  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">`;

    // Add BPMN shapes for each node
    Object.entries(nodePositions).forEach(([nodeId, pos]) => {
      xml += `\n      <bpmndi:BPMNShape id="${nodeId}_di" bpmnElement="${nodeId}">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"/>
      </bpmndi:BPMNShape>`;
    });

    // Add BPMN edges for each connection
    if (connections && connections.length > 0) {
      connections.forEach((conn: any) => {
        const flowId = `Flow_${conn.from}_to_${conn.to}`;
        const sourceNodeId = `node_${conn.from}`;
        const targetNodeId = `node_${conn.to}`;
        
        const sourcePos = nodePositions[sourceNodeId];
        const targetPos = nodePositions[targetNodeId];
        
        if (sourcePos && targetPos) {
          // Calculate waypoints for the flow
          const sourceX = sourcePos.x + sourcePos.width;
          const sourceY = sourcePos.y + (sourcePos.height / 2);
          const targetX = targetPos.x;
          const targetY = targetPos.y + (targetPos.height / 2);
          
          xml += `\n      <bpmndi:BPMNEdge id="${flowId}_di" bpmnElement="${flowId}">
        <di:waypoint x="${sourceX}" y="${sourceY}"/>
        <di:waypoint x="${targetX}" y="${targetY}"/>
      </bpmndi:BPMNEdge>`;
        }
      });
    }

    xml += `\n    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    console.log('✅ Generated complete BPMN XML with diagram info:', xml.substring(0, 400) + '...');
    return xml;
  };

  // Create minimal BPMN XML as fallback with diagram information
  const createMinimalBPMN = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start" />
    <bpmn:task id="Task_1" name="Process Step" />
    <bpmn:endEvent id="EndEvent_1" name="End" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="100" y="100" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="200" y="80" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="350" y="100" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="136" y="118"/>
        <di:waypoint x="200" y="118"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="300" y="118"/>
        <di:waypoint x="350" y="118"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
  };

  // Initialize BPMN modeler
  const initializeModeler = () => {
    if (!containerRef.current || modelerRef.current) {
      console.log('🔧 BPMN Modeler: Container not ready or already initialized', {
        container: !!containerRef.current,
        modeler: !!modelerRef.current
      });
      return;
    }
    
    console.log('🔧 BPMN Modeler: Initializing with container:', containerRef.current);
    
    try {
      const modeler = new BpmnModeler({
        container: containerRef.current,
        additionalModules: [],
        moddleExtensions: {}
      });

      modelerRef.current = modeler;
      console.log('✅ BPMN Modeler: Initialized successfully');
      
      // Set up event listeners
      modeler.on('import.done', (event: any) => {
        if (event.error) {
          console.error('❌ BPMN import error:', event.error);
          setIsLoadingMap(false);
        } else {
          console.log('✅ BPMN diagram imported successfully');
          setIsLoadingMap(false);
          // Auto-fit the diagram
          const canvas = modeler.get('canvas');
          canvas.zoom('fit-viewport');
        }
      });
    } catch (error) {
      console.error('❌ BPMN Modeler initialization error:', error);
      setIsLoadingMap(false);
      setBpmnModelerFailed(true);
    }
  };

  // Load BPMN XML into modeler
  const loadBPMNXML = async (xml: string) => {
    if (!modelerRef.current) return;
    
    // Validate XML before importing
    if (!xml || xml.trim() === '') {
      console.error('❌ Empty XML provided to loadBPMNXML');
      displayToast('Unable to visualize process. Please refine or clarify your description.', 'error');
      setIsLoadingMap(false);
      return;
    }
    
    if (!xml.includes('<bpmn:definitions') || !xml.includes('</bpmn:definitions>')) {
      console.error('❌ Invalid BPMN XML structure:', xml.substring(0, 200));
      displayToast('Unable to visualize process. Please refine or clarify your description.', 'error');
      setIsLoadingMap(false);
      return;
    }
    
    try {
      setIsLoadingMap(true);
      console.log('🔧 Importing BPMN XML:', xml.substring(0, 200) + '...');
      
      await modelerRef.current.importXML(xml);
      console.log('✅ BPMN XML loaded successfully');
      
      // Auto-fit the diagram
      const canvas = modelerRef.current.get('canvas');
      canvas.zoom('fit-viewport');
      
    } catch (error) {
      console.error('❌ BPMN import error:', error);
      setIsLoadingMap(false);
      setBpmnModelerFailed(true);
      displayToast('Unable to visualize process. Please refine or clarify your description.', 'error');
    }
  };

  // Initialize modeler and load XML in one function
  const initializeAndLoadXML = async (xml: string) => {
    try {
      // Ensure container is ready
      if (!containerRef.current) {
        console.log('🔧 Container not ready, retrying...');
        setTimeout(() => initializeAndLoadXML(xml), 100);
        return;
      }

      // Initialize modeler if not already done
      if (!modelerRef.current) {
        initializeModeler();
      }

      // Wait for modeler to be ready, then load XML
      const loadXML = () => {
        if (modelerRef.current) {
          loadBPMNXML(xml);
        } else {
          setTimeout(loadXML, 50);
        }
      };
      
      setTimeout(loadXML, 100);
    } catch (error) {
      console.error('Error in initializeAndLoadXML:', error);
      setIsLoadingMap(false);
    }
  };

  // Check if generated map needs clarification
  const checkForClarificationNeeds = (mapData: any) => {
    const { nodes, lanes } = mapData;
    
    // Check for ambiguous activities
    const ambiguousNodes = nodes.filter((node: any) => {
      if (node.type !== 'activity') return false;
      
      const label = node.label.toLowerCase();
      const ambiguousPhrases = [
        'someone', 'they', 'the system', 'it', 'someone else',
        'review', 'check', 'verify', 'process', 'handle'
      ];
      
      // Check for vague language
      const hasVagueLanguage = ambiguousPhrases.some(phrase => label.includes(phrase));
      
      // Check for missing lane assignment
      const hasNoLane = !node.lane || node.lane === 'unknown';
      
      return hasVagueLanguage || hasNoLane;
    });

    if (ambiguousNodes.length > 0) {
      const firstAmbiguous = ambiguousNodes[0];
      const clarificationKey = `${firstAmbiguous.label}_${firstAmbiguous.type}`;
      
      // Check if we already have clarification for this step
      if (cachedClarifications.has(clarificationKey)) {
        return null; // Already clarified
      }

      return {
        step: firstAmbiguous.label,
        question: generateClarificationQuestion(firstAmbiguous),
        context: `This step appears to be unclear. We need more specific information about who performs this action and what exactly happens.`,
        nodeId: firstAmbiguous.id,
        clarificationKey: clarificationKey
      };
    }

    return null;
  };

  // Generate appropriate clarification question
  const generateClarificationQuestion = (node: any) => {
    const label = node.label.toLowerCase();
    
    if (label.includes('someone') || label.includes('they')) {
      return `Who specifically performs "${node.label}"? Please specify the role or department.`;
    }
    
    if (label.includes('review') || label.includes('check') || label.includes('verify')) {
      return `What exactly is being reviewed/checked in "${node.label}"? What are the criteria or steps involved?`;
    }
    
    if (label.includes('process') || label.includes('handle')) {
      return `What are the specific steps involved in "${node.label}"? Who performs this action?`;
    }
    
    if (!node.lane || node.lane === 'unknown') {
      return `Which role or department is responsible for "${node.label}"?`;
    }
    
    return `Can you provide more specific details about "${node.label}"? What exactly happens in this step?`;
  };

  // Handle clarification submission
  const handleClarification = async (clarification: string) => {
    if (!clarificationRequest) return;

    setIsProcessingClarification(true);
    
    try {
      // Handle domain mismatch clarification differently
      if (clarificationRequest.type === 'domain_mismatch') {
        console.log('🔄 Regenerating process map with domain clarification:', clarification);
        
        // For domain mismatch, regenerate the entire process map with the clarification
        const aiService = AIService.getInstance();
        const enhancedDescription = `${clarificationRequest.step}: ${clarification}`;
        const result = await aiService.generateProcessMap(enhancedDescription);
        
        if (result.success && result.map) {
          // Generate BPMN XML from the new map
          const newXml = generateBPMNXML(result.map);
          
          // Update the modeler with the new XML
          await initializeAndLoadXML(newXml);
          
          // Update state with the new map
          setGeneratedMap(result.map);
          
          // Auto-save the new map
          await saveMapToSupabase(result.map, newXml);
          
          // Show success toast
          displayToast('✅ Process map regenerated with correct context.', 'success');
        } else {
          // Show error toast
          displayToast('⚠️ Could not regenerate process map. Please try again.', 'error');
        }
      } else {
        // Handle step clarification as before
        // Cache the clarification
        setCachedClarifications(prev => {
          const newMap = new Map(prev);
          newMap.set(clarificationRequest.clarificationKey, clarification);
          return newMap;
        });

        // Regenerate the map with clarification
        const aiService = AIService.getInstance();
        const result = await aiService.regenerateProcessMapWithClarification({
          originalStep: clarificationRequest.step,
          clarification: clarification,
          currentMap: generatedMap
        });
        
        if (result.success && result.map) {
          // Generate BPMN XML from the updated map
          const updatedXml = generateBPMNXML(result.map);
          
          // Update the modeler with the new XML
          await initializeAndLoadXML(updatedXml);
          
          // Update state with the new map
          setGeneratedMap(result.map);
          
          // Auto-save the updated map
          await saveMapToSupabase(result.map, updatedXml);
          
          // Show success toast
          displayToast('✅ Process map updated with your clarification.', 'success');
        } else {
          // Show error toast
          displayToast('⚠️ Could not update process map. Please try again.', 'error');
        }
      }
      
      setShowClarificationModal(false);
      setClarificationRequest(null);
      
    } catch (error) {
      console.error('❌ Error processing clarification:', error);
      displayToast('❌ Error processing clarification. Please try again.', 'error');
    } finally {
      setIsProcessingClarification(false);
    }
  };

  // Convert AI-generated map to BPMN format and save it
  const handleGeneratedMap = async (mapData: any, clarificationNeeded?: boolean, error?: string) => {
    try {
      console.log('🤖 AIProcessMapperView: Processing generated map:', mapData, { clarificationNeeded, error });
      
      // Check if domain context validation failed
      if (clarificationNeeded && error) {
        console.log('⚠️ Domain context validation failed:', error);
        setClarificationRequest({
          step: 'Domain Context Mismatch',
          reason: 'The AI seems to have misunderstood your process.',
          message: `The AI seems to have misunderstood your process. ${error}. Please confirm whether the process is about the topic you described.`,
          type: 'domain_mismatch'
        });
        setShowClarificationModal(true);
        return; // Don't proceed until clarification is provided
      }
      
      // Check if clarification is needed for unclear steps
      const stepClarificationNeeded = checkForClarificationNeeds(mapData);
      
      if (stepClarificationNeeded) {
        setClarificationRequest(stepClarificationNeeded);
        setShowClarificationModal(true);
        return; // Don't proceed until clarification is provided
      }
      
      // Store the map data for immediate display
      setGeneratedMap(mapData);
      
      // Generate BPMN XML
      const bpmnXML = generateBPMNXML(mapData);
      console.log('🔧 Generated BPMN XML:', bpmnXML.substring(0, 200) + '...');
      
      // Initialize modeler and load XML
      await initializeAndLoadXML(bpmnXML);

      // Fallback timeout - if BPMN modeler doesn't load within 5 seconds, show fallback
      setTimeout(() => {
        if (isLoadingMap) {
          console.log('⏰ BPMN Modeler timeout - falling back to simplified view');
          setIsLoadingMap(false);
          setBpmnModelerFailed(true);
        }
      }, 5000);
      
      // Trigger auto-save if user is available
      if (user?.id) {
        autoSaveMap(mapData, lastSavedId);
      }
      
    } catch (error) {
      console.error('❌ Error handling generated map:', error);
    }
  };

  // Auto-save function with debounce
  const autoSaveMap = async (mapData: any, diagramId: string = null) => {
    if (!user?.id) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        );

        const bpmnXML = generateBPMNXML(mapData);
        
        const diagramData = {
          id: uuidv4(),
          user_id: user.id,
          project_id: selectedProject?.id || 'default',
          name: `AI Generated Process Map - ${new Date().toLocaleDateString()}`,
          xml: bpmnXML
        };

        let result;
        if (diagramId) {
          // Update existing diagram
          result = await supabase
            .from('process_diagrams')
            .update(diagramData)
            .eq('id', diagramId)
            .eq('user_id', user.id)
            .select('*');
        } else {
          // Create new diagram
          result = await supabase
            .from('process_diagrams')
            .insert(diagramData)
            .select('*');
        }

        if (result.error) {
          throw result.error;
        }

        const savedData = Array.isArray(result.data) ? result.data[0] : result.data;
        console.log('✅ Auto-saved process map:', savedData.id);
        setLastSavedId(savedData.id);
        setSaveStatus('saved');
        
        // Store diagram ID for potential editing
        sessionStorage.setItem('selectedDiagramId', savedData.id);
        
        // Clear saved status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
        
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
        setSaveStatus('error');
        
        // Clear error status after 5 seconds
        setTimeout(() => setSaveStatus('idle'), 5000);
      }
    }, 2000); // 2 second debounce
  };

  // Clear the generated map
  const clearGeneratedMap = () => {
    setGeneratedMap(null);
    setBpmnModelerFailed(false);
    setSaveStatus('idle');
    setLastSavedId(null);
    
    // Clear save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (modelerRef.current) {
      modelerRef.current.destroy();
      modelerRef.current = null;
    }
  };

  // Enhanced fallback visual representation component with swimlanes
  const ProcessMapFallback = ({ mapData }: { mapData: any }) => {
    const { lanes, nodes, connections } = mapData;
    
    // Group nodes by lane
    const nodesByLane = lanes ? lanes.reduce((acc: any, lane: any) => {
      acc[lane.id] = {
        lane: lane,
        nodes: nodes.filter((node: any) => node.lane === lane.id)
      };
      return acc;
    }, {}) : { 'default': { lane: { id: 'default', label: 'General Process' }, nodes: nodes } };
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generated Process Map
          </h3>
          {lanes && lanes.length > 1 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {lanes.length} swimlanes • {nodes.length} steps
            </div>
          )}
        </div>

        {/* Swimlanes */}
        {Object.values(nodesByLane).map((laneData: any, index: number) => (
          <div key={laneData.lane.id} className="mb-6 last:mb-0">
            {/* Lane Header */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-t-lg p-3">
              <h4 className="text-md font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                {laneData.lane.label}
                {laneData.lane.role && (
                  <span className="text-sm font-normal text-blue-600 dark:text-blue-300">
                    ({laneData.lane.role})
                  </span>
                )}
              </h4>
            </div>

            {/* Lane Content */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border-l border-r border-b border-gray-200 dark:border-gray-600 rounded-b-lg p-4">
              {laneData.nodes.length > 0 ? (
                <div className="space-y-3">
                  {laneData.nodes.map((node: any, nodeIndex: number) => (
                    <div key={node.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                        node.type === 'start' ? 'bg-green-500' :
                        node.type === 'end' ? 'bg-red-500' :
                        node.type === 'decision' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {node.type}
                          </span>
                          {node.type === 'decision' && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                              Decision Point
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {node.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="w-8 h-8 mx-auto mb-2 opacity-50">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm">No activities assigned to this lane</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Process Flow */}
        {connections && connections.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Process Flow
            </h4>
            <div className="space-y-2">
              {connections.map((conn: any, index: number) => {
                const fromNode = nodes.find((n: any) => n.id === conn.from);
                const toNode = nodes.find((n: any) => n.id === conn.to);
                const fromLane = lanes ? lanes.find((l: any) => l.id === fromNode?.lane) : null;
                const toLane = lanes ? lanes.find((l: any) => l.id === toNode?.lane) : null;
                
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                          {fromLane ? fromLane.label : 'General'}
                        </span>
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                          {toLane ? toLane.label : 'General'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{fromNode?.label || conn.from}</span>
                        {conn.condition && (
                          <>
                            {' '}
                            <span className="text-gray-500 dark:text-gray-400">→</span>
                            {' '}
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {conn.condition}
                            </span>
                          </>
                        )}
                        {' '}
                        <span className="text-gray-500 dark:text-gray-400">→</span>
                        {' '}
                        <span className="font-medium">{toNode?.label || conn.to}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                Process Map Generated Successfully!
              </h5>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your process map has been automatically saved. Click "Edit in Full Editor" to see the complete BPMN diagram with advanced editing capabilities, or "Clear Map" to generate a new one.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
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
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                AI Process Mapper
              </h1>
              {/* Save Status Indicator */}
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && (
                  <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Saving...</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">💾 Saved</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">⚠️ Couldn't save — retrying...</span>
                  </div>
                )}
              </div>
            </div>
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
              
              {/* Process Map Display */}
              {bpmnModelerFailed ? (
                <ProcessMapFallback mapData={generatedMap} />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                  <div 
                    ref={containerRef}
                    className="w-full rounded-lg"
                    style={{ 
                      width: "100%", 
                      height: "80vh", 
                      minHeight: "500px",
                      background: "#fff",
                      border: "1px solid #e5e7eb"
                    }}
                  />
                  {isLoadingMap && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600 dark:text-gray-400">Rendering diagram...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
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
          onGenerate={(mapData, clarificationNeeded, error) => {
            handleGeneratedMap(mapData, clarificationNeeded, error);
            setShowGenerateModal(false);
          }}
        />
      )}

      {/* Clarification Modal */}
      <ClarificationModal
        isOpen={showClarificationModal}
        onClose={() => setShowClarificationModal(false)}
        onClarify={handleClarification}
        clarificationRequest={clarificationRequest}
        isProcessing={isProcessingClarification}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
            toastType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200'
              : toastType === 'error'
              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200'
              : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{toastMessage}</span>
              <button
                onClick={() => setShowToast(false)}
                className="text-current opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
