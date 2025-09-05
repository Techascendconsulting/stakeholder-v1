import { useState, useEffect } from 'react';
import { FolderOpen, Plus, ChevronDown, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import ProcessMapper from '../ProcessMapper';
import { supabaseDiagramStorage } from '../../utils/supabaseDiagramStorage';
import { supabase } from '../../lib/supabase';

interface ExistingDiagram {
	id: string;
	name?: string | null;
	updated_at?: string | null;
}

const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export default function ProcessMapperView() {
	const { setCurrentView, selectedProject } = useApp();
	const { user } = useAuth();
	const [diagramId, setDiagramId] = useState<string>('');
	const [existing, setExisting] = useState<ExistingDiagram[]>([]);
	const [openPicker, setOpenPicker] = useState(false);
	const [loadingList, setLoadingList] = useState(false);
	const [listError, setListError] = useState<string | null>(null);

	// Generate a UUID id
	const createNewId = () => crypto.randomUUID();

	// Helper: fetch diagrams with fallbacks for schema differences and cleanup duplicates
	const fetchDiagrams = async (projectId: string): Promise<ExistingDiagram[]> => {
		console.log('🔍 ProcessMapperView: Fetching diagrams for project:', projectId, 'user:', user?.id);
		
		if (!user?.id) {
			console.log('🔍 ProcessMapperView: No user ID, returning empty list');
			return [];
		}
		
		// Attempt 1: project_id column with user_id filter
		try {
			const { data, error } = await supabase
				.from('process_diagrams')
				.select('id,name,updated_at')
				.eq('project_id', projectId)
				.eq('user_id', user.id)
				.order('updated_at', { ascending: false });
			if (error) throw error;
			
			console.log('🔍 ProcessMapperView: Found diagrams in database:', data?.length || 0, data);
			
			// Return all diagrams - don't filter by name as multiple diagrams can have the same name
			const uniqueDiagrams = data || [];
			
			return uniqueDiagrams;
		} catch (_) {
			// Attempt 2: projectId (camelCase) with user_id filter
			try {
				const { data, error } = await supabase
					.from('process_diagrams')
					.select('id,name,updated_at')
					.eq('projectId', projectId)
					.eq('user_id', user.id)
					.order('updated_at', { ascending: false });
				if (error) throw error;
				
				// Return all diagrams - don't filter by name as multiple diagrams can have the same name
				const uniqueDiagrams = data || [];
				
				return uniqueDiagrams;
			} catch (_) {
				// Attempt 3: no project filter (show all for user, newest first)
				const { data } = await supabase
					.from('process_diagrams')
					.select('id,name,updated_at')
					.eq('user_id', user.id)
					.order('updated_at', { ascending: false });
				
				// Return all diagrams - don't filter by name as multiple diagrams can have the same name
				const uniqueDiagrams = data || [];
				
				return uniqueDiagrams;
			}
		}
	};

	// Clean up duplicate diagrams in the database
	const cleanupDuplicateDiagrams = async () => {
		if (!selectedProject || !user?.id) return;
		
		try {
			// Get all diagrams for this project and user
			const { data: allDiagrams, error } = await supabase
				.from('process_diagrams')
				.select('*')
				.eq('project_id', selectedProject.id)
				.eq('user_id', user.id)
				.order('updated_at', { ascending: false });
			
			if (error) throw error;
			
			// Find duplicates by name
			const duplicates = allDiagrams.reduce((acc: any[], diagram: any) => {
				const existing = acc.find(d => d.name === diagram.name);
				if (existing) {
					// Keep the most recent one
					if (new Date(diagram.updated_at || 0) > new Date(existing.updated_at || 0)) {
						// Remove the older one
						acc = acc.filter(d => d.id !== existing.id);
						acc.push(diagram);
					}
				} else {
					acc.push(diagram);
				}
				return acc;
			}, []);
			
			// Delete all diagrams and re-insert the unique ones
			if (duplicates.length < allDiagrams.length) {
				await supabase
					.from('process_diagrams')
					.delete()
					.eq('project_id', selectedProject.id)
					.eq('user_id', user.id);
				
				for (const diagram of duplicates) {
					await supabase
						.from('process_diagrams')
						.insert(diagram);
				}
				
				// Refresh the list
				const list = await fetchDiagrams(selectedProject.id);
				setExisting(list);
				
				alert(`Cleaned up ${allDiagrams.length - duplicates.length} duplicate diagrams`);
			}
		} catch (error) {
			console.error('Failed to cleanup duplicates:', error);
			alert('Failed to cleanup duplicates. Please try again.');
		}
	};

	// Initial diagram selection: prefer last used id from session, else most recent, else create new
	useEffect(() => {
		if (!selectedProject) return;
		
		console.log('🔍 ProcessMapperView: Initializing with project:', selectedProject.id);
		
		const lastId = sessionStorage.getItem('selectedDiagramId');
		console.log('🔍 ProcessMapperView: Last diagram ID from session:', lastId);
		
		if (lastId && isUuid(lastId)) {
			console.log('🔍 ProcessMapperView: Using last diagram ID:', lastId);
			setDiagramId(lastId);
		} else {
			let cancelled = false;
			(async () => {
				try {
					setLoadingList(true);
					setListError(null);
					const list = await fetchDiagrams(selectedProject.id);
					if (!cancelled) {
						console.log('🔍 ProcessMapperView: Setting existing diagrams:', list.length, list);
						setExisting(list);
						if (list.length > 0) {
							// Use the most recent diagram
							console.log('🔍 ProcessMapperView: Using most recent diagram:', list[0].id);
							setDiagramId(list[0].id);
						} else {
							// No diagrams exist yet - don't create one automatically
							// Let user explicitly create one when they're ready
							console.log('🔍 ProcessMapperView: No diagrams found, setting empty ID');
							setDiagramId('');
						}
					}
				} catch (e: any) {
					console.error('🔍 ProcessMapperView: Error loading diagrams:', e);
					if (!cancelled) setListError(e?.message || 'Failed to load diagrams');
				} finally {
					if (!cancelled) setLoadingList(false);
				}
			})();
			return () => {
				cancelled = true;
			};
		}
	}, [selectedProject, user?.id]);

	// Persist last selected diagram id
	useEffect(() => {
		if (diagramId && isUuid(diagramId)) sessionStorage.setItem('selectedDiagramId', diagramId);
	}, [diagramId]);

	// Keyboard navigation for diagram tabs
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl+N for new diagram
			if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
				e.preventDefault();
				handleCreateNew();
				return;
			}
			
			// Arrow keys for navigation
			if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
				const currentIndex = existing.findIndex(d => d.id === diagramId);
				if (currentIndex === -1) return;
				
				let newIndex: number;
				if (e.key === 'ArrowLeft') {
					newIndex = currentIndex > 0 ? currentIndex - 1 : existing.length - 1;
				} else {
					newIndex = currentIndex < existing.length - 1 ? currentIndex + 1 : 0;
				}
				
				if (existing[newIndex]) {
					handleDiagramSwitch(existing[newIndex].id);
					e.preventDefault();
				}
			}
		};
		
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [existing, diagramId]);

	const handleBack = () => {
		const returnToView = sessionStorage.getItem('returnToView');
		if (returnToView) {
			setCurrentView(returnToView as any);
			sessionStorage.removeItem('returnToView');
			sessionStorage.removeItem('returnToTab');
		} else {
			setCurrentView('process-mapper');
		}
	};

	const handleOpenToggle = async () => {
		if (!selectedProject) return;
		const willOpen = !openPicker;
		setOpenPicker(willOpen);
		if (!willOpen) return;
		setLoadingList(true);
		setListError(null);
		try {
			const list = await fetchDiagrams(selectedProject.id);
			setExisting(list);
		} catch (e: any) {
			setListError(e?.message || 'Failed to load diagrams');
		} finally {
			setLoadingList(false);
		}
	};

	const handleCreateNew = async () => {
		if (!selectedProject) return;
		
		console.log('🆕 ProcessMapperView: Creating new diagram');
		
		const newId = createNewId();
		
		// Generate a unique name for the new diagram
		const existingNames = existing.map(d => d.name || '').filter(name => name.startsWith('Untitled Diagram'));
		let diagramName = 'Untitled Diagram';
		if (existingNames.length > 0) {
			// Find the next available number
			const numbers = existingNames
				.map(name => {
					const match = name.match(/Untitled Diagram(?: (\d+))?/);
					return match ? (match[1] ? parseInt(match[1]) : 1) : 0;
				})
				.filter(num => num > 0);
			
			const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 2;
			diagramName = `Untitled Diagram ${nextNumber}`;
		}
		
		const newDiagram = {
			id: newId,
			name: diagramName,
			updated_at: new Date().toISOString()
		};
		
		try {
			// Save to database
			await supabase
				.from('process_diagrams')
				.insert({
					id: newId,
					name: diagramName,
					project_id: selectedProject.id,
					xml: `<?xml version="1.0" encoding="UTF-8"?>
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
</bpmn:definitions>`,
					updated_at: new Date().toISOString()
				});
			
			// Add to existing diagrams list
			setExisting(prev => [...prev, newDiagram]);
			
			// Set as current diagram
			setDiagramId(newId);
			
			// Close the picker if it's open
			setOpenPicker(false);
			
			// Auto-scroll to the new diagram after a short delay
			setTimeout(() => {
				const tabsContainer = document.querySelector('.diagram-tabs-scroll') as HTMLElement;
				if (tabsContainer) {
					tabsContainer.scrollLeft = tabsContainer.scrollWidth;
				}
			}, 100);
		} catch (error) {
			console.error('❌ ProcessMapperView: Failed to create diagram:', error);
			alert('Failed to create diagram. Please try again.');
		}
	};

	const handleRenameDiagram = async (diagramId: string, newName: string) => {
		if (!selectedProject || !newName.trim()) return;
		
		try {
			// Update in database
			await supabase
				.from('process_diagrams')
				.update({ 
					name: newName.trim(),
					updated_at: new Date().toISOString()
				})
				.eq('id', diagramId);
			
			// Update local state
			setExisting(prev => prev.map(d => 
				d.id === diagramId 
					? { ...d, name: newName.trim(), updated_at: new Date().toISOString() }
					: d
			));
		} catch (error) {
			console.error('Failed to rename diagram:', error);
			alert('Failed to rename diagram. Please try again.');
		}
	};

	const handleDeleteDiagram = async (diagramIdToDelete: string) => {
		if (!selectedProject || !confirm('Are you sure you want to delete this diagram? This action cannot be undone.')) return;
		
		try {
			// Delete from database
			await supabase
				.from('process_diagrams')
				.delete()
				.eq('id', diagramIdToDelete);
			
			// Update local state
			setExisting(prev => prev.filter(d => d.id !== diagramIdToDelete));
			
			// If this was the current diagram, switch to another one or clear
			if (diagramIdToDelete === diagramId) {
				const remaining = existing.filter(d => d.id !== diagramIdToDelete);
				if (remaining.length > 0) {
					setDiagramId(remaining[0].id);
				} else {
					setDiagramId('');
				}
			}
		} catch (error) {
			console.error('Failed to delete diagram:', error);
			alert('Failed to delete diagram. Please try again.');
		}
	};

	// Handle diagram switching with proper save-before-switch logic
	const handleDiagramSwitch = async (newDiagramId: string) => {
		if (newDiagramId === diagramId) return; // No change needed
		
		console.log('🔄 ProcessMapperView: Switching from', diagramId, 'to', newDiagramId);
		
		// Note: The ProcessMapper component will handle auto-saving before loading the new diagram
		// We just need to update the diagramId, which will trigger the load in ProcessMapper
		setDiagramId(newDiagramId);
	};

	const handleDeleteAllCorruptedDiagrams = async () => {
		if (!selectedProject || !confirm('This will delete ALL diagrams and start fresh. Are you sure?')) return;
		
		try {
			// Delete all diagrams for this project
			await supabase
				.from('process_diagrams')
				.delete()
				.eq('project_id', selectedProject.id);
			
			// Clear local state
			setExisting([]);
			setDiagramId('');
			
			alert('All diagrams deleted. You can now create fresh diagrams.');
		} catch (error) {
			console.error('Failed to delete all diagrams:', error);
			alert('Failed to delete diagrams. Please try again.');
		}
	};

	if (!selectedProject) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">No Project Selected</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-6">Please select a project before accessing the Process Mapper.</p>
					<button onClick={() => setCurrentView('training-hub')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Go to Training Hub</button>
				</div>
			</div>
		);
	}

	return (
		<div className="relative h-screen w-full">
			{/* Mapper */}
			<div className="h-full w-full">
				{diagramId ? (
					<ProcessMapper
						projectId={selectedProject.id}
						diagramId={diagramId}
						storage={supabaseDiagramStorage}
						onBack={handleBack}
						title={`Process Map - ${selectedProject.name}`}
					/>
				) : (
					<div className="flex items-center justify-center h-full bg-gray-50">
						<div className="text-center">
							<div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
								<svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">No Diagrams Yet</h3>
							<p className="text-gray-600 mb-6">Create your first process map to get started</p>
							<button 
								onClick={handleCreateNew}
								className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
							>
								<Plus className="w-5 h-5" />
								Create First Diagram
							</button>
						</div>
					</div>
				)}
			</div>
			
			{/* Dedicated Diagram Tabs Area - Positioned below Process Mapper header */}
			{diagramId && (
				<div className="absolute z-20 top-20 left-0 right-0 h-16 bg-white border-b border-gray-200 px-4 py-2 diagram-tabs-area">
					{/* Top row - Diagram tabs with dedicated space */}
					<div className="flex items-center gap-2 h-8 mb-2">
						{/* Left side - Diagram tabs with proper overflow */}
						<div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
							<div className="flex items-center gap-2 overflow-x-auto scrollbar-hide diagram-tabs-scroll flex-1 pr-4">
								{existing.map((d, index) => (
									<div key={d.id} className="relative group flex-shrink-0">
										<button
											onClick={() => handleDiagramSwitch(d.id)}
											className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-2 diagram-tab ${diagramId === d.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/90 border-gray-200 hover:bg-white'}`}
											title={`${d.name || 'Untitled Diagram'} (${index + 1}/${existing.length}) - Use ← → keys to navigate`}
										>
											<span className="truncate max-w-32">{d.name || `Diagram ${d.id.slice(0, 8)}`}</span>
											{d.name?.startsWith('Untitled Diagram') && (
												<span
													role="button"
													onClick={(e) => {
														e.stopPropagation();
														const newName = prompt('Enter new name for diagram:', d.name || 'Untitled Diagram');
														if (newName && newName.trim()) {
															handleRenameDiagram(d.id, newName.trim());
														}
													}}
													className="ml-1 p-0.5 hover:bg-blue-700 rounded opacity-70 hover:opacity-100 inline-flex items-center justify-center"
													title="Rename diagram"
												>
													<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</span>
											)}
										</button>
										{/* Delete button for non-active diagrams */}
										{diagramId !== d.id && (
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteDiagram(d.id);
												}}
												className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
												title="Delete diagram"
											>
												×
											</button>
										)}
									</div>
								))}
							</div>
							
							{/* New button - always visible and properly spaced */}
							<button onClick={handleCreateNew} className="px-3 py-1.5 bg-white/90 border border-gray-200 rounded-lg shadow-sm hover:bg-white transition-colors flex items-center gap-2 text-sm flex-shrink-0 ml-2" title="Create new diagram (Ctrl+N)">
								<Plus className="w-4 h-4" />
								<span>New</span>
							</button>
						</div>
						
						{/* Right side - Action buttons, always visible and properly spaced */}
						<div className="flex items-center gap-2 flex-shrink-0 ml-4">
							{existing.length > 0 && (
								<button 
									onClick={handleDeleteAllCorruptedDiagrams}
									className="px-3 py-1.5 bg-red-100 border border-red-300 rounded-lg shadow-sm hover:bg-red-200 transition-colors text-sm text-red-800"
									title="Delete all corrupted diagrams and start fresh"
								>
									🗑️ Reset All
								</button>
							)}
							{existing.length > 1 && (
								<button 
									onClick={cleanupDuplicateDiagrams}
									className="px-3 py-1.5 bg-yellow-100 border border-yellow-300 rounded-lg shadow-sm hover:bg-yellow-200 transition-colors text-sm text-yellow-800"
									title="Clean up duplicate diagrams"
								>
									🧹 Cleanup
								</button>
							)}
							<button onClick={handleOpenToggle} className="px-3 py-1.5 bg-white/90 border border-gray-200 rounded-lg shadow-sm hover:bg-white transition-colors flex items-center gap-2 text-sm">
								<FolderOpen className="w-4 h-4" />
								<span>Open</span>
								<ChevronDown className="w-3 h-3" />
							</button>
						</div>
					</div>
					
					{/* Bottom row - Scroll indicators and status */}
					<div className="flex items-center justify-between h-6 text-xs text-gray-500">
						{/* Left - Scroll indicators */}
						{existing.length > 3 && (
							<div className="flex items-center gap-1">
								<span title="Use ← → arrow keys to navigate">← Scroll to see more diagrams →</span>
							</div>
						)}
						
						{/* Right - Empty space for balance */}
						<div></div>
					</div>
				</div>
			)}
			
			{/* Picker Panel - Positioned below diagram tabs area */}
			{openPicker && (
				<div className="absolute z-30 top-36 left-2 bg-white border border-gray-200 rounded-lg shadow-lg w-80">
					<div className="flex items-center justify-between px-3 py-2 border-b">
						<span className="text-sm font-medium">Project Diagrams</span>
						<button onClick={() => setOpenPicker(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
					</div>
					<div className="max-h-72 overflow-auto">
						{loadingList && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
						{listError && <div className="px-3 py-2 text-sm text-red-600">{listError}</div>}
						{!loadingList && !listError && existing.length === 0 && (
							<div className="px-3 py-3 text-sm text-gray-500">No diagrams yet. Create a new one.</div>
						)}
						{existing.map((d) => (
							<button
								key={d.id}
								onClick={() => {
									handleDiagramSwitch(d.id);
									setOpenPicker(false);
								}}
								className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${diagramId === d.id ? 'bg-blue-50' : ''}`}
							>
								<div className="text-sm font-medium text-gray-900 truncate">{d.name || d.id}</div>
								<div className="text-xs text-gray-500">{d.updated_at ? new Date(d.updated_at).toLocaleString() : ''}</div>
							</button>
						))}
					</div>
					<div className="px-3 py-2 border-t">
						<button onClick={handleCreateNew} className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
							<Plus className="w-4 h-4" />
							<span>New Diagram</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
