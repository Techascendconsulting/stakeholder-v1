# AI Process Mapper - Archived

## Overview
The AI Process Mapper feature has been archived to simplify the MVP. This feature allowed users to generate BPMN process diagrams using AI from natural language descriptions.

## Archived Files
The following files have been moved to the `feature/ai-process-mapper-archive` branch:

- `src/components/Views/AIProcessMapperView.tsx` - Main AI process mapping interface
- `src/components/Common/GenerateMapModal.tsx` - Modal for process map generation and clarifications
- `src/utils/bpmnBuilder.ts` - BPMN XML generation utility with lane assignment and layout

## Archived Functionality
The following functions were removed from `src/services/aiService.ts`:

- `generateProcessMap()` - Generate process maps from descriptions
- `regenerateProcessMapWithClarification()` - Update maps with user clarifications
- `normalizeMap()` - Normalize map specifications with forced roles
- `parseAIResponseToDiagram()` - Parse AI responses to diagram format
- `extractContextKeywords()` - Extract context keywords from descriptions
- `validateContextConsistency()` - Validate context consistency between input and generated maps
- `extractRoles()` - Extract roles and departments from descriptions
- `extractRolesFallback()` - Fallback role extraction using keyword patterns
- `assignLanesToNodes()` - Assign nodes to appropriate lanes based on role matching
- `validateLaneAssignment()` - Validate lane assignment and decision branching

## Features Preserved
The following AI features remain active:

- Stakeholder conversation AI (voice meetings)
- AI-powered meeting summaries and transcripts
- Stakeholder response generation
- Interview notes generation
- General AI assistance

## Archive Location
- **Branch**: `feature/ai-process-mapper-archive`
- **Remote**: `origin/feature/ai-process-mapper-archive`
- **Commit**: Contains all process mapping functionality with BPMN generation

## Restoration
To restore the AI Process Mapper feature:

1. Checkout the archive branch: `git checkout feature/ai-process-mapper-archive`
2. Copy the archived files back to main branch
3. Restore the functions in `aiService.ts`
4. Update imports and routes in `MainLayout.tsx` and `Sidebar.tsx`

## Technical Notes
- The feature included BPMN 2.0 XML generation with swimlanes
- Supported role-based lane assignment and decision branching
- Integrated with Supabase for saving process diagrams
- Used OpenAI GPT-4 for process map generation
- Included domain validation to prevent AI hallucination

## Date Archived
January 28, 2025 - Moved to archive branch for MVP simplification
