/* eslint-disable */
export type Lane = { id: string; name: string };
export type NodeType = 'start' | 'task' | 'decision' | 'end';
export type Node = {
  id: string;
  type: NodeType;
  label: string;
  laneId?: string;
};
export type Connection = { id?: string; from: string; to: string; label?: string };
export type MapSpec = { title?: string; lanes: Lane[]; nodes: Node[]; connections: Connection[] };

function esc(s: string = '') {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function topoLevels(nodes: Node[], edges: Connection[]): Record<string,number> {
  const indeg: Record<string,number> = {};
  nodes.forEach(n=> indeg[n.id]=0);
  edges.forEach(e=> indeg[e.to] = (indeg[e.to]||0) + 1);
  const q:string[] = nodes.filter(n=> indeg[n.id]===0).map(n=>n.id);
  const lvl: Record<string,number> = {};
  q.forEach(id => lvl[id]=0);
  while(q.length){
    const u = q.shift()!;
    const out = edges.filter(e=> e.from===u).map(e=>e.to);
    out.forEach(v=>{
      indeg[v] -= 1;
      if(indeg[v]===0){
        lvl[v] = Math.max(lvl[u]+1, lvl[v] ?? 0);
        q.push(v);
      } else {
        // still assign at least current+1 to spread
        lvl[v] = Math.max(lvl[v] ?? 0, (lvl[u] ?? 0)+1);
      }
    });
  }
  // fallback: anything unvisited
  nodes.forEach(n=> { if(lvl[n.id]===undefined) lvl[n.id]=0; });
  return lvl;
}

function ensureBranches(spec: MapSpec): MapSpec {
  // For each decision, ensure >= 2 outgoing connections. If only one, add a default alternate to End.
  const outBy = (id:string)=> spec.connections.filter(c=>c.from===id);
  for (const gw of spec.nodes.filter(n=> n.type==='decision')) {
    const outs = outBy(gw.id);
    if (outs.length < 2) {
      const yesExists = outs.some(o=> (o.label||'').toLowerCase().includes('yes') || (o.label||'').toLowerCase().includes('true') );
      const altLabel = yesExists ? 'No' : 'False';
      const endId = `End_${gw.id}_alt`;
      if (!spec.nodes.find(n=> n.id===endId)) {
        spec.nodes.push({ id: endId, type: 'end', label: 'End' });
      }
      spec.connections.push({ from: gw.id, to: endId, label: altLabel });
    }
  }
  return spec;
}

function assignLanes(spec: MapSpec): MapSpec {
  const lanes = spec.lanes.length ? spec.lanes : [{ id:'lane_1', name:'General' }];
  spec.lanes = lanes;
  const defLane = lanes[0].id;
  spec.nodes = spec.nodes.map(n=>{
    if (n.laneId) return n;
    const match = lanes.find(l=> new RegExp(`\\b${l.name}\\b`, 'i').test(n.label));
    return { ...n, laneId: match?.id ?? defLane };
  });
  return spec;
}

export function buildBPMN(specIn: MapSpec): string {
  // 1) Normalize spec
  let spec = JSON.parse(JSON.stringify(specIn)) as MapSpec;
  spec = ensureBranches(spec);
  spec = assignLanes(spec);

  // 2) Layout params
  const laneHeight = 200;
  const laneGap = 10;
  const left = 80;
  const top = 80;
  const nodeW = 120;
  const nodeH = 80;
  const colGap = 160;
  const procWidth = 1400;

  // 3) Compute levels (columns)
  const level = topoLevels(spec.nodes, spec.connections);

  // 4) Coordinates per node (x,y centered within lane)
  const coords: Record<string,{x:number;y:number}> = {};
  for (const n of spec.nodes) {
    const laneIndex = Math.max(0, spec.lanes.findIndex(l=> l.id === (n.laneId || spec.lanes[0].id)));
    const yTop = top + laneIndex * (laneHeight + laneGap) + (laneHeight - nodeH)/2;
    const x = left + 40 + (level[n.id] * (nodeW + colGap));
    coords[n.id] = { x, y: yTop };
  }

  // 5) Build XML sections
  const defsOpen = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">`;

  const procId = 'Process_1';
  let proc = `  <bpmn:process id="${procId}" isExecutable="false">\n`;

  // Lanes
  if (spec.lanes.length) {
    proc += `    <bpmn:laneSet id="LaneSet_1">\n`;
    for (const lane of spec.lanes) {
      proc += `      <bpmn:lane id="${esc(lane.id)}" name="${esc(lane.name)}">\n`;
      for (const n of spec.nodes.filter(nn=> nn.laneId === lane.id)) {
        proc += `        <bpmn:flowNodeRef>${esc(n.id)}</bpmn:flowNodeRef>\n`;
      }
      proc += `      </bpmn:lane>\n`;
    }
    proc += `    </bpmn:laneSet>\n`;
  }

  // Flow nodes
  for (const n of spec.nodes) {
    if (n.type === 'start') proc += `    <bpmn:startEvent id="${esc(n.id)}" name="${esc(n.label)}" />\n`;
    else if (n.type === 'end') proc += `    <bpmn:endEvent id="${esc(n.id)}" name="${esc(n.label)}" />\n`;
    else if (n.type === 'task') proc += `    <bpmn:task id="${esc(n.id)}" name="${esc(n.label)}" />\n`;
    else if (n.type === 'decision') proc += `    <bpmn:exclusiveGateway id="${esc(n.id)}" name="${esc(n.label)}" />\n`;
  }

  // Sequence flows
  const flowIds: string[] = [];
  let flowXml = '';
  let flowIdx = 1;
  for (const c of spec.connections) {
    const id = c.id || `Flow_${flowIdx++}`;
    flowIds.push(id);
    const cond = (c.label && c.label.trim().length)
      ? `\n      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[${c.label}]]></bpmn:conditionExpression>\n    `
      : '';
    flowXml += `    <bpmn:sequenceFlow id="${id}" sourceRef="${esc(c.from)}" targetRef="${esc(c.to)}">${cond}</bpmn:sequenceFlow>\n`;
  }
  proc += flowXml;
  proc += `  </bpmn:process>\n`;

  // 6) BPMNDI
  let di = `  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n`;
  di += `    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${procId}">\n`;

  // Lane shapes
  spec.lanes.forEach((lane, i) => {
    const y = top + i * (laneHeight + laneGap);
    di += `      <bpmndi:BPMNShape id="${esc(lane.id)}_di" bpmnElement="${esc(lane.id)}">\n`;
    di += `        <dc:Bounds x="${left}" y="${y}" width="${procWidth}" height="${laneHeight}"/>\n`;
    di += `      </bpmndi:BPMNShape>\n`;
  });

  // Node shapes
  for (const n of spec.nodes) {
    const { x, y } = coords[n.id];
    const w = (n.type==='decision') ? 50 : (n.type==='start' || n.type==='end') ? 36 : nodeW;
    const h = (n.type==='decision') ? 50 : (n.type==='start' || n.type==='end') ? 36 : nodeH;
    di += `      <bpmndi:BPMNShape id="${esc(n.id)}_di" bpmnElement="${esc(n.id)}">\n`;
    di += `        <dc:Bounds x="${x}" y="${y}" width="${w}" height="${h}"/>\n`;
    di += `      </bpmndi:BPMNShape>\n`;
  }

  // Edge waypoints
  let fx = 0;
  for (const c of spec.connections) {
    const s = coords[c.from];
    const t = coords[c.to];
    const sid = `${esc(c.from)}_center_${++fx}`;
    const eid = `${esc(c.to)}_center_${fx}`;
    // simple orthogonal routing with a shared mid X
    const midX = Math.max(s.x, t.x) - 10;
    const sy = s.y + (spec.nodes.find(n=> n.id===c.from)?.type==='decision' ? 25 : nodeH/2);
    const ty = t.y + (spec.nodes.find(n=> n.id===c.to)?.type==='decision' ? 25 : nodeH/2);
    di += `      <bpmndi:BPMNEdge id="${(c.id||`Flow_${fx}`)}_di" bpmnElement="${(c.id||`Flow_${fx}`)}">\n`;
    di += `        <di:waypoint x="${s.x + nodeW}" y="${sy}"/>\n`;
    di += `        <di:waypoint x="${midX}" y="${sy}"/>\n`;
    di += `        <di:waypoint x="${midX}" y="${ty}"/>\n`;
    di += `        <di:waypoint x="${t.x}" y="${ty}"/>\n`;
    di += `      </bpmndi:BPMNEdge>\n`;
  }

  di += `    </bpmndi:BPMNPlane>\n`;
  di += `  </bpmndi:BPMNDiagram>\n`;

  const defsClose = `</bpmn:definitions>`;
  const xml = [defsOpen, proc, di, defsClose].join('');
  return xml;
}
