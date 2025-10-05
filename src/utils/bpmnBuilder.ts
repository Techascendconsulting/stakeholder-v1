/* eslint-disable */
export type Lane = { id: string; name: string };
export type NodeType = 'start' | 'startEvent' | 'task' | 'activity' | 'decision' | 'exclusiveGateway' | 'end' | 'endEvent';
export type Node = {
  id: string;
  type: NodeType;
  label: string;
  laneId?: string;
  lane?: string;
};
export type Connection = { id?: string; from: string; to: string; label?: string; condition?: string };
export type MapSpec = { 
  title?: string; 
  lanes?: string[] | Lane[]; 
  nodes: Node[]; 
  connections: Connection[] 
};

function esc(s: string = '') {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

// Normalize lanes to consistent format
function normalizeLanes(lanes: string[] | Lane[] | undefined): Lane[] {
  if (!lanes || lanes.length === 0) {
    return [{ id: 'lane_1', name: 'General' }];
  }
  
  return lanes.map((lane, index) => {
    if (typeof lane === 'string') {
      return { id: `lane_${index + 1}`, name: lane };
    }
    return lane;
  });
}

// Ensure we have start and end events
function ensureStartEnd(spec: MapSpec): MapSpec {
  const hasStart = spec.nodes.some(n => n.type === 'start' || n.type === 'startEvent');
  const hasEnd = spec.nodes.some(n => n.type === 'end' || n.type === 'endEvent');
  
  if (!hasStart) {
    spec.nodes.unshift({ 
      id: 'StartEvent_1', 
      type: 'startEvent', 
      label: 'Start',
      laneId: spec.nodes[0]?.laneId || 'lane_1'
    });
    
    // Connect start to first non-start node
    const firstNode = spec.nodes.find(n => n.id !== 'StartEvent_1');
    if (firstNode) {
      spec.connections.unshift({ 
        from: 'StartEvent_1', 
        to: firstNode.id 
      });
    }
  }
  
  if (!hasEnd) {
    spec.nodes.push({ 
      id: 'EndEvent_1', 
      type: 'endEvent', 
      label: 'End',
      laneId: spec.nodes[spec.nodes.length - 1]?.laneId || 'lane_1'
    });
    
    // Connect last non-end node to end
    const lastNode = spec.nodes[spec.nodes.length - 2];
    if (lastNode && lastNode.id !== 'EndEvent_1') {
      spec.connections.push({ 
        from: lastNode.id, 
        to: 'EndEvent_1' 
      });
    }
  }
  
  return spec;
}

// Ensure decision nodes have multiple branches
function ensureBranches(spec: MapSpec): MapSpec {
  const decisionNodes = spec.nodes.filter(n => 
    n.type === 'decision' || n.type === 'exclusiveGateway'
  );
  
  decisionNodes.forEach(decision => {
    const outgoingConnections = spec.connections.filter(c => c.from === decision.id);
    
    if (outgoingConnections.length < 2) {
      // Add a default "No" or "False" branch to end
      const endNode = spec.nodes.find(n => n.type === 'end' || n.type === 'endEvent');
      if (endNode) {
        const yesExists = outgoingConnections.some(c => 
          (c.label || '').toLowerCase().includes('yes') || 
          (c.label || '').toLowerCase().includes('true')
        );
        
        const altLabel = yesExists ? 'No' : 'False';
        spec.connections.push({
          from: decision.id,
          to: endNode.id,
          label: altLabel
        });
      }
    }
  });
  
  return spec;
}

// Assign nodes to lanes based on lane property or laneId
function assignNodesToLanes(spec: MapSpec): MapSpec {
  const lanes = spec.lanes as Lane[];
  
  spec.nodes = spec.nodes.map(node => {
    // If node already has laneId, use it
    if (node.laneId) {
      return node;
    }
    
    // If node has lane property, match it to a lane
    if (node.lane) {
      const matchingLane = lanes.find(lane => 
        lane.name.toLowerCase().includes(node.lane!.toLowerCase()) ||
        node.lane!.toLowerCase().includes(lane.name.toLowerCase())
      );
      
      if (matchingLane) {
        return { ...node, laneId: matchingLane.id };
      }
    }
    
    // Default to first lane
    return { ...node, laneId: lanes[0].id };
  });
  
  return spec;
}

// Calculate topological levels for horizontal positioning
function calculateLevels(nodes: Node[], connections: Connection[]): Record<string, number> {
  const levels: Record<string, number> = {};
  const inDegree: Record<string, number> = {};
  
  // Initialize in-degree
  nodes.forEach(node => {
    inDegree[node.id] = 0;
    levels[node.id] = 0;
  });
  
  // Calculate in-degree
  connections.forEach(conn => {
    inDegree[conn.to] = (inDegree[conn.to] || 0) + 1;
  });
  
  // Find nodes with no incoming edges (start nodes)
  const queue: string[] = nodes
    .filter(node => inDegree[node.id] === 0)
    .map(node => node.id);
  
  // BFS to assign levels
  while (queue.length > 0) {
    const current = queue.shift()!;
    const outgoing = connections
      .filter(conn => conn.from === current)
      .map(conn => conn.to);
    
    outgoing.forEach(target => {
      levels[target] = Math.max(levels[target], levels[current] + 1);
      inDegree[target]--;
      
      if (inDegree[target] === 0) {
        queue.push(target);
      }
    });
  }
  
  return levels;
}

export function buildBPMN(specIn: MapSpec): string {
  console.log('🔧 BPMN Builder: Input spec:', specIn);
  
  // 1) Normalize and validate the spec
  let spec = JSON.parse(JSON.stringify(specIn)) as MapSpec;
  
  // Normalize lanes
  spec.lanes = normalizeLanes(spec.lanes);
  
  // Ensure start and end events
  spec = ensureStartEnd(spec);
  
  // Ensure decision branches
  spec = ensureBranches(spec);
  
  // Assign nodes to lanes
  spec = assignNodesToLanes(spec);
  
  console.log('🔧 BPMN Builder: Normalized spec:', spec);

  // 2) Layout parameters
  const laneHeight = 150;
  const laneGap = 20;
  const leftMargin = 100;
  const topMargin = 100;
  const nodeWidth = 140;
  const nodeHeight = 80;
  const columnGap = 200;
  const processWidth = 1200;
  const processHeight = spec.lanes.length * (laneHeight + laneGap) + topMargin;

  // 3) Calculate node positions
  const levels = calculateLevels(spec.nodes, spec.connections);
  const maxLevel = Math.max(...Object.values(levels), 0);
  
  // Calculate coordinates for each node
  const nodeCoords: Record<string, {x: number, y: number}> = {};
  
  spec.nodes.forEach(node => {
    const laneIndex = spec.lanes.findIndex(lane => lane.id === node.laneId);
    const level = levels[node.id] || 0;
    
    // Calculate position within the lane
    const x = leftMargin + (level * (nodeWidth + columnGap));
    const laneY = topMargin + (laneIndex * (laneHeight + laneGap));
    const y = laneY + ((laneHeight - nodeHeight) / 2);
    
    nodeCoords[node.id] = { x, y };
    
    console.log(`🔧 Node ${node.id} (${node.label}) -> Lane: ${node.laneId}, Level: ${level}, Coords: (${x}, ${y})`);
  });

  // 4) Build BPMN XML
  const processId = 'Process_1';
  
  // XML Header
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">`;

  // Process definition
  let processXml = `  <bpmn:process id="${processId}" isExecutable="false">\n`;
  
  // Lane set
  if (spec.lanes.length > 0) {
    processXml += `    <bpmn:laneSet id="LaneSet_1">\n`;
    spec.lanes.forEach(lane => {
      processXml += `      <bpmn:lane id="${esc(lane.id)}" name="${esc(lane.name)}">\n`;
      // Add flow node references for nodes in this lane
      spec.nodes
        .filter(node => node.laneId === lane.id)
        .forEach(node => {
          processXml += `        <bpmn:flowNodeRef>${esc(node.id)}</bpmn:flowNodeRef>\n`;
        });
      processXml += `      </bpmn:lane>\n`;
    });
    processXml += `    </bpmn:laneSet>\n`;
  }

  // Flow nodes
  spec.nodes.forEach(node => {
    const nodeType = node.type === 'startEvent' || node.type === 'start' ? 'startEvent' :
                    node.type === 'endEvent' || node.type === 'end' ? 'endEvent' :
                    node.type === 'exclusiveGateway' || node.type === 'decision' ? 'exclusiveGateway' :
                    'task';
    
    const elementName = `bpmn:${nodeType}`;
    processXml += `    <${elementName} id="${esc(node.id)}" name="${esc(node.label)}" />\n`;
  });

  // Sequence flows
  let flowIndex = 1;
  spec.connections.forEach(connection => {
    const flowId = connection.id || `Flow_${flowIndex++}`;
    const conditionXml = connection.label ? 
      `\n      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[${esc(connection.label)}]]></bpmn:conditionExpression>\n    ` : '';
    
    processXml += `    <bpmn:sequenceFlow id="${esc(flowId)}" sourceRef="${esc(connection.from)}" targetRef="${esc(connection.to)}">${conditionXml}</bpmn:sequenceFlow>\n`;
  });

  processXml += `  </bpmn:process>\n`;

  // BPMN Diagram Information (BPMNDI)
  let diagramXml = `  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n`;
  diagramXml += `    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">\n`;

  // Lane shapes
  spec.lanes.forEach((lane, index) => {
    const y = topMargin + (index * (laneHeight + laneGap));
    diagramXml += `      <bpmndi:BPMNShape id="${esc(lane.id)}_di" bpmnElement="${esc(lane.id)}" isHorizontal="true">\n`;
    diagramXml += `        <dc:Bounds x="${leftMargin}" y="${y}" width="${processWidth}" height="${laneHeight}"/>\n`;
    diagramXml += `      </bpmndi:BPMNShape>\n`;
  });

  // Node shapes
  spec.nodes.forEach(node => {
    const coords = nodeCoords[node.id];
    const isStartOrEnd = node.type === 'startEvent' || node.type === 'start' || 
                        node.type === 'endEvent' || node.type === 'end';
    const isGateway = node.type === 'exclusiveGateway' || node.type === 'decision';
    
    const width = isGateway ? 50 : isStartOrEnd ? 36 : nodeWidth;
    const height = isGateway ? 50 : isStartOrEnd ? 36 : nodeHeight;
    
    diagramXml += `      <bpmndi:BPMNShape id="${esc(node.id)}_di" bpmnElement="${esc(node.id)}">\n`;
    diagramXml += `        <dc:Bounds x="${coords.x}" y="${coords.y}" width="${width}" height="${height}"/>\n`;
    diagramXml += `      </bpmndi:BPMNShape>\n`;
  });

  // Edge shapes (sequence flows)
  flowIndex = 1;
  spec.connections.forEach(connection => {
    const flowId = connection.id || `Flow_${flowIndex++}`;
    const sourceCoords = nodeCoords[connection.from];
    const targetCoords = nodeCoords[connection.to];
    
    // Calculate waypoints for the connection
    const sourceNode = spec.nodes.find(n => n.id === connection.from);
    const targetNode = spec.nodes.find(n => n.id === connection.to);
    
    const isSourceGateway = sourceNode?.type === 'exclusiveGateway' || sourceNode?.type === 'decision';
    const isTargetGateway = targetNode?.type === 'exclusiveGateway' || targetNode?.type === 'decision';
    
    const sourceWidth = isSourceGateway ? 50 : (sourceNode?.type === 'startEvent' || sourceNode?.type === 'start' || 
                                               sourceNode?.type === 'endEvent' || sourceNode?.type === 'end') ? 36 : nodeWidth;
    const targetWidth = isTargetGateway ? 50 : (targetNode?.type === 'startEvent' || targetNode?.type === 'start' || 
                                               targetNode?.type === 'endEvent' || targetNode?.type === 'end') ? 36 : nodeWidth;
    
    const sourceHeight = isSourceGateway ? 50 : (sourceNode?.type === 'startEvent' || sourceNode?.type === 'start' || 
                                                sourceNode?.type === 'endEvent' || sourceNode?.type === 'end') ? 36 : nodeHeight;
    const targetHeight = isTargetGateway ? 50 : (targetNode?.type === 'startEvent' || targetNode?.type === 'start' || 
                                                targetNode?.type === 'endEvent' || targetNode?.type === 'end') ? 36 : nodeHeight;
    
    const sourceX = sourceCoords.x + sourceWidth;
    const sourceY = sourceCoords.y + (sourceHeight / 2);
    const targetX = targetCoords.x;
    const targetY = targetCoords.y + (targetHeight / 2);
    
    // Simple orthogonal routing
    const midX = Math.max(sourceX, targetX) - 50;
    
    diagramXml += `      <bpmndi:BPMNEdge id="${esc(flowId)}_di" bpmnElement="${esc(flowId)}">\n`;
    diagramXml += `        <di:waypoint x="${sourceX}" y="${sourceY}"/>\n`;
    diagramXml += `        <di:waypoint x="${midX}" y="${sourceY}"/>\n`;
    diagramXml += `        <di:waypoint x="${midX}" y="${targetY}"/>\n`;
    diagramXml += `        <di:waypoint x="${targetX}" y="${targetY}"/>\n`;
    diagramXml += `      </bpmndi:BPMNEdge>\n`;
  });

  diagramXml += `    </bpmndi:BPMNPlane>\n`;
  diagramXml += `  </bpmndi:BPMNDiagram>\n`;

  // Combine all parts
  const xmlFooter = `</bpmn:definitions>`;
  const fullXml = [xmlHeader, processXml, diagramXml, xmlFooter].join('');
  
  console.log('🔧 BPMN Builder: Generated XML length:', fullXml.length);
  return fullXml;
}
