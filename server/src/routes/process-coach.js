const OpenAI = require('openai');

// Local linting rules
const VAGUE_WORDS = ['check', 'handle', 'process', 'stuff', 'things', 'do', 'misc'];
const WHITELISTED_GERUNDS = ['billing', 'training', 'marketing', 'shipping'];
const VERB_LIST = [
  'Approve', 'Validate', 'Verify', 'Create', 'Update', 'Submit', 'Send', 'Receive', 
  'Notify', 'Assign', 'Escalate', 'Calculate', 'Record', 'Review', 'Confirm', 
  'Collect', 'Schedule', 'Authenticate', 'Authorize', 'Archive', 'Export', 'Import', 
  'Generate', 'Reconcile', 'Match'
];

// Local linting function
function localLint(xml) {
  const suggestions = [];
  
  try {
    // Use a simple regex-based approach for server-side XML parsing
    // This is a simplified version that works without DOM APIs
    
    // Check for start/end events
    const startEventMatch = xml.match(/<bpmn:startEvent|<startEvent/g);
    const endEventMatch = xml.match(/<bpmn:endEvent|<endEvent/g);
    
    if (!startEventMatch || startEventMatch.length === 0) {
      suggestions.push({
        ruleId: 'MISSING_START',
        severity: 'critical',
        issue: 'No Start Event found',
        suggestion: 'Add a Start Event to show where the process begins'
      });
    }
    
    if (!endEventMatch || endEventMatch.length === 0) {
      suggestions.push({
        ruleId: 'MISSING_END',
        severity: 'critical',
        issue: 'No End Event found',
        suggestion: 'Add an End Event to show where the process completes'
      });
    }
    
    // Check tasks for verb+object pattern using regex
    const taskMatches = xml.match(/<bpmn:task[^>]*name="([^"]*)"[^>]*>|<task[^>]*name="([^"]*)"[^>]*>/g);
    if (taskMatches) {
      taskMatches.forEach((match) => {
        const nameMatch = match.match(/name="([^"]*)"/);
        const idMatch = match.match(/id="([^"]*)"/);
        
        if (nameMatch && idMatch) {
          const label = nameMatch[1];
          const elementId = idMatch[1];
          
          if (!label) return;
          
          const words = label.trim().split(/\s+/);
          
          // Check for vague words
          if (VAGUE_WORDS.some(vague => label.toLowerCase().includes(vague))) {
            suggestions.push({
              ruleId: 'TASK_VAGUE_WORD',
              severity: 'warning',
              where: { elementId },
              issue: `Task "${label}" uses vague language`,
              suggestion: 'Use specific verb + object (e.g., "Validate ID documents" instead of "Check stuff")'
            });
          }
          
          // Check for gerunds (unless whitelisted)
          if (label.toLowerCase().endsWith('ing') && !WHITELISTED_GERUNDS.includes(label.toLowerCase())) {
            suggestions.push({
              ruleId: 'TASK_GERUND',
              severity: 'warning',
              where: { elementId },
              issue: `Task "${label}" uses gerund form`,
              suggestion: 'Use imperative verb + object (e.g., "Validate documents" instead of "Validating documents")'
            });
          }
          
          // Check verb+object pattern
          if (words.length < 2) {
            suggestions.push({
              ruleId: 'TASK_VERB_OBJECT',
              severity: 'critical',
              where: { elementId },
              issue: `Task "${label}" is too short`,
              suggestion: 'Use verb + object format (e.g., "Validate ID documents")'
            });
          } else {
            const firstWord = words[0];
            const isValidVerb = VERB_LIST.some(verb => 
              firstWord.toLowerCase() === verb.toLowerCase()
            );
            
            if (!isValidVerb) {
              suggestions.push({
                ruleId: 'TASK_VERB_OBJECT',
                severity: 'warning',
                where: { elementId },
                issue: `Task "${label}" doesn't start with a clear action verb`,
                suggestion: `Start with a clear verb like: ${VERB_LIST.slice(0, 5).join(', ')}...`
              });
            }
          }
        }
      });
    }
    
  } catch (error) {
    console.error('Error in local linting:', error);
  }
  
  return suggestions;
}

async function processCoachRoutes(fastify, options) {
  const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
  });

  fastify.post('/api/process-coach', async (request, reply) => {
    try {
      const { xml, context } = request.body;
      
      if (!xml) {
        return reply.code(400).send({ error: 'XML content is required' });
      }
      
      // Run local linting first
      const localSuggestions = localLint(xml);
      
      // Prepare system prompt
      const systemPrompt = `You are a Business Analyst process-mapping coach.
Input: BPMN XML. Output: a JSON array of actionable issues.
Use ONLY these rules:

At least one Start Event and one End Event.

Tasks must use verb + object labels (e.g., "Validate ID documents"). Flag vague names (check, handle, process, do, stuff, things) and gerunds used as actions.

Exclusive gateways must be phrased as a question, and each outgoing sequence flow is labeled (Yes/No or specific).

Swimlanes reflect owners (role/team/system). Steps should sit in the correct lane.

Use Text Annotations for key business rules, exceptions, SLAs (don't cram rules into task names).

Flow is left-to-right where practical; minimize crossing lines.

Keep feedback concise: issue, why it matters, and one clear fix.

Provide where.elementId when possible.

If something is good (e.g., clear start/end), you may include positive notes as severity: "info".

Return JSON only, no prose.`;

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this BPMN XML and provide suggestions:\n\n${xml}\n\nContext: ${JSON.stringify(context || {})}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      // Parse AI suggestions
      let aiSuggestions = [];
      try {
        // Extract JSON from response (handle cases where AI adds extra text)
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          aiSuggestions = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Error parsing AI response:', error);
        // Fallback: return local suggestions only
        return reply.send({ suggestions: localSuggestions });
      }

      // Merge and deduplicate suggestions
      const allSuggestions = [...localSuggestions, ...aiSuggestions];
      const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => 
        index === self.findIndex(s => s.ruleId === suggestion.ruleId && s.issue === suggestion.issue)
      );

      return reply.send({ 
        suggestions: uniqueSuggestions,
        localCount: localSuggestions.length,
        aiCount: aiSuggestions.length
      });

    } catch (error) {
      console.error('Error in process-coach:', error);
      return reply.code(500).send({ error: 'Failed to analyze process' });
    }
  });
}

module.exports = processCoachRoutes;
