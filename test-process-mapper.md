# Process Mapper Functionality Test Plan

## Test Environment
- App running on localhost:3003
- Process Mapper component loaded
- Supabase database connected

## Test Cases

### 1. Basic Component Loading
- [ ] ProcessMapper component renders without errors
- [ ] BPMN.js canvas loads properly
- [ ] Default diagram displays correctly
- [ ] No console errors

### 2. New Diagram Creation
- [ ] "New" button in sheets bar works
- [ ] "New Diagram" button in picker works
- [ ] New diagram creates unique ID
- [ ] New diagram saves to database
- [ ] New diagram appears in sheets bar
- [ ] New diagram opens with clean canvas

### 3. Diagram Saving
- [ ] Save button works when changes made
- [ ] Save button disabled when no changes
- [ ] Changes persist after refresh
- [ ] Save status updates correctly

### 4. Diagram Loading
- [ ] Existing diagrams load from database
- [ ] Diagram switching works via sheets bar
- [ ] Diagram switching works via picker
- [ ] No data loss during switching

### 5. Diagram Management
- [ ] Sheets bar shows all diagrams
- [ ] Active diagram highlighted
- [ ] Diagram names display correctly
- [ ] Timestamps show correctly

### 6. Export Functionality
- [ ] Export SVG works
- [ ] Export PNG works
- [ ] Files download with correct names
- [ ] No errors during export

### 7. Zoom Controls
- [ ] Zoom in works
- [ ] Zoom out works
- [ ] Fit to view works
- [ ] 100% reset works
- [ ] Zoom percentage displays correctly

### 8. Undo/Redo
- [ ] Undo works
- [ ] Redo works
- [ ] Command stack tracks changes
- [ ] Dirty state updates correctly

### 9. Navigation
- [ ] Back button works
- [ ] Return to previous view works
- [ ] Session storage persists context

### 10. Error Handling
- [ ] Database errors handled gracefully
- [ ] BPMN.js errors handled gracefully
- [ ] User feedback for errors
- [ ] Fallback to default diagram

## Test Execution Steps

1. Open app in browser
2. Navigate to Process Mapper
3. Test each feature systematically
4. Document any issues found
5. Verify fixes work correctly

## Expected Results

All functionality should work smoothly with:
- No console errors
- Proper state management
- Database persistence
- Smooth user experience
- Modern Silicon Valley UX standards


























