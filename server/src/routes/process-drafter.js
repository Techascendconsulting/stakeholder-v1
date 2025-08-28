const OpenAI = require('openai');

async function processDrafterRoutes(fastify, options) {
  const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
  });

  fastify.post('/api/process-drafter', async (request, reply) => {
    try {
      const { prompt, mode = 'as-is', industry } = request.body;
      
      if (!prompt) {
        return reply.code(400).send({ error: 'Process description is required' });
      }

      const systemPrompt = `You convert plain-language process descriptions into BPMN. Extract actors (lanes), steps (tasks), decisions, start/end, and key annotations. Return JSON with { lanes: string[], guide: string[], bpmnXml: string }. Use only the core symbols: StartEvent, EndEvent, Task, ExclusiveGateway, SequenceFlow, Pool/Lane, TextAnnotation. Keep names verb+object, gateways phrased as questions, label Yes/No flows.

Rules:
- Tasks must use verb + object format (e.g., "Validate ID documents")
- Gateways must be phrased as questions
- Sequence flows should be labeled (Yes/No or specific)
- Use swimlanes for different actors/roles
- Include Text Annotations for important business rules
- Keep the XML clean and well-structured

Return only valid JSON, no additional text.`;

      const userPrompt = `Convert this process description to BPMN:

Process: ${prompt}
Mode: ${mode}
Industry: ${industry || 'General'}

Generate a complete BPMN diagram with proper lanes, tasks, decisions, and annotations.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response
      let result;
      try {
        // Extract JSON from response - try multiple patterns
        let jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          // Try to find JSON array
          jsonMatch = response.match(/\[[\s\S]*\]/);
        }
        if (!jsonMatch) {
          // Try to extract just the content between curly braces
          jsonMatch = response.match(/\{[\s\S]*\}/s);
        }
        
        if (jsonMatch) {
          // Clean the JSON string before parsing
          let jsonString = jsonMatch[0];
          
          // Replace problematic characters in XML
          jsonString = jsonString.replace(/\n/g, '\\n');
          jsonString = jsonString.replace(/\r/g, '\\r');
          jsonString = jsonString.replace(/\t/g, '\\t');
          
          // Fix ALL single quotes in XML attributes - more comprehensive approach
          jsonString = jsonString.replace(/'/g, '"');
          
          // Fix any double quotes that got doubled up
          jsonString = jsonString.replace(/""/g, '"');
          
          result = JSON.parse(jsonString);
        } else {
          console.error('No JSON found in AI response:', response);
          // Return a fallback response
          result = {
            lanes: ['Customer', 'System'],
            guide: [
              '1. Add a Start Event for "Customer submits application"',
              '2. Add a Task for "Review application" in the System lane',
              '3. Add a Gateway for "Is application approved?"',
              '4. Add Tasks for "Send approval" and "Send rejection"',
              '5. Add End Events for both paths'
            ],
            bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_Customer" name="Customer" processRef="Process_Customer" />
    <bpmn:participant id="Participant_System" name="System" processRef="Process_System" />
    <bpmn:startEvent id="StartEvent_1" name="Customer submits application">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Review application">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_1" name="Is application approved?">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_2" name="Send approval letter">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_3" name="Send rejection letter">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Application approved">
      <bpmn:incoming>Flow_5</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="EndEvent_2" name="Application rejected">
      <bpmn:incoming>Flow_6</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Gateway_1" targetRef="Task_2" name="Yes" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Gateway_1" targetRef="Task_3" name="No" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="EndEvent_1" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_3" targetRef="EndEvent_2" />
  </bpmn:collaboration>
  <bpmn:process id="Process_Customer" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmn:process id="Process_System" isExecutable="false">
    <bpmn:task id="Task_1" />
    <bpmn:exclusiveGateway id="Gateway_1" />
    <bpmn:task id="Task_2" />
    <bpmn:task id="Task_3" />
    <bpmn:endEvent id="EndEvent_1" />
    <bpmn:endEvent id="EndEvent_2" />
  </bpmn:process>
</bpmn:definitions>`
          };
        }
      } catch (error) {
        console.error('Error parsing AI response:', error);
        console.error('Raw response:', response);
        return reply.code(500).send({ error: 'Failed to parse AI response' });
      }

      // Validate the response structure
      if (!result.lanes || !result.guide || !result.bpmnXml) {
        console.error('Invalid response structure:', result);
        return reply.code(500).send({ error: 'Invalid response structure from AI' });
      }

      return reply.send(result);

    } catch (error) {
      console.error('Error in process-drafter:', error);
      return reply.code(500).send({ error: 'Failed to generate process draft' });
    }
  });
}

module.exports = processDrafterRoutes;
