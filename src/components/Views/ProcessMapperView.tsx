import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, ChevronDown, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
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
	const [diagramId, setDiagramId] = useState<string>('');
	const [existing, setExisting] = useState<ExistingDiagram[]>([]);
	const [openPicker, setOpenPicker] = useState(false);
	const [loadingList, setLoadingList] = useState(false);
	const [listError, setListError] = useState<string | null>(null);

	// Generate a UUID id
	const createNewId = () => crypto.randomUUID();

	// Helper: fetch diagrams with fallbacks for schema differences
	const fetchDiagrams = async (projectId: string): Promise<ExistingDiagram[]> => {
		// Attempt 1: project_id column
		try {
			const { data, error } = await supabase
				.from('process_diagrams')
				.select('id,name,updated_at')
				.eq('project_id', projectId)
				.order('updated_at', { ascending: false });
			if (error) throw error;
			return Array.isArray(data) ? (data as ExistingDiagram[]) : [];
		} catch (_) {
			// Attempt 2: projectId (camelCase)
			try {
				const { data, error } = await supabase
					.from('process_diagrams')
					.select('id,name,updated_at')
					.eq('projectId', projectId)
					.order('updated_at', { ascending: false });
				if (error) throw error;
				return Array.isArray(data) ? (data as ExistingDiagram[]) : [];
			} catch (_) {
				// Attempt 3: no project filter (show all, newest first)
				const { data } = await supabase
					.from('process_diagrams')
					.select('id,name,updated_at')
					.order('updated_at', { ascending: false });
				return Array.isArray(data) ? (data as ExistingDiagram[]) : [];
			}
		}
	};

	// Initial diagram selection: prefer last used id from session, else most recent, else new
	useEffect(() => {
		if (!selectedProject) return;
		const lastId = sessionStorage.getItem('selectedDiagramId');
		if (lastId && isUuid(lastId)) {
			setDiagramId(lastId);
		} else {
			let cancelled = false;
			(async () => {
				try {
					setLoadingList(true);
					setListError(null);
					const list = await fetchDiagrams(selectedProject.id);
					if (!cancelled) {
						setExisting(list);
						if (list.length > 0) {
							setDiagramId(list[0].id);
						} else {
							setDiagramId(createNewId());
						}
					}
				} catch (e: any) {
					if (!cancelled) setListError(e?.message || 'Failed to load diagrams');
				} finally {
					if (!cancelled) setLoadingList(false);
				}
			})();
			return () => {
				cancelled = true;
			};
		}
	}, [selectedProject]);

	// Persist last selected diagram id
	useEffect(() => {
		if (diagramId && isUuid(diagramId)) sessionStorage.setItem('selectedDiagramId', diagramId);
	}, [diagramId]);

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

	const handleCreateNew = () => {
		const newId = createNewId();
		setDiagramId(newId);
		setOpenPicker(false);
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
			{/* Sheets tab bar */}
			<div className="absolute z-20 top-2 left-2 right-2 flex items-center gap-2 overflow-x-auto">
				<div className="flex items-center gap-2">
					{existing.map((d) => (
						<button
							key={d.id}
							onClick={() => setDiagramId(d.id)}
							className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${diagramId === d.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/90 border-gray-200 hover:bg-white'}`}
						>
							{d.name || d.id.slice(0, 8)}
						</button>
					))}
					<button onClick={handleCreateNew} className="px-3 py-1.5 bg-white/90 border border-gray-200 rounded-lg shadow-sm hover:bg-white transition-colors flex items-center gap-2 text-sm">
						<Plus className="w-4 h-4" />
						<span>New</span>
					</button>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<button onClick={handleOpenToggle} className="px-3 py-1.5 bg-white/90 border border-gray-200 rounded-lg shadow-sm hover:bg-white transition-colors flex items-center gap-2 text-sm">
						<FolderOpen className="w-4 h-4" />
						<span>Open</span>
						<ChevronDown className="w-3 h-3" />
					</button>
				</div>
			</div>

			{/* Picker Panel */}
			{openPicker && (
				<div className="absolute z-30 top-12 left-2 bg-white border border-gray-200 rounded-lg shadow-lg w-80">
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
									setDiagramId(d.id);
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

			{/* Mapper */}
			<div className="h-full w-full">
				{diagramId && (
					<ProcessMapper
						projectId={selectedProject.id}
						diagramId={diagramId}
						storage={supabaseDiagramStorage}
						onBack={handleBack}
						title={`Process Map - ${selectedProject.name}`}
					/>
				)}
			</div>
		</div>
	);
}
