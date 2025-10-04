import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GenerateMapModal from '../Common/GenerateMapModal';
import { supabaseDiagramStorage } from '../../utils/supabaseDiagramStorage';
import { supabase } from '../../lib/supabase';

export default function AIProcessMapperView() {
  const { setCurrentView, selectedProject } = useApp();
  const { user } = useAuth();
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Convert AI-generated map to BPMN format and save it
  const handleGeneratedMap = async (mapData: any) => {
    try {
      console.log('🤖 AIProcessMapperView: Processing generated map:', mapData);
      
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
      
      // Navigate to the process mapper editor with the new diagram
      setCurrentView('process-mapper-editor');
      
      // Store the diagram ID in sessionStorage so ProcessMapperView can load it
      sessionStorage.setItem('selectedDiagramId', diagramId);
      
    } catch (error) {
      console.error('❌ Error handling generated map:', error);
    }
  };

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

          {/* Content */}
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
