// Bounded history and document revisions, independent of rendering and UI.
(function (root) {
    const isSelectionOperation = operation => ['select_atom', 'deselect_atom', 'clear_selection'].includes(operation.type);
    function createHistory(limit = 50) {
        if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('History limit must be a positive integer');
        const history = {
            undoStack: [], redoStack: [], nextEditRevision: 0, currentEditRevision: 0, savedEditRevision: 0,
            reset() {
                this.undoStack = [];
                this.redoStack = [];
                this.nextEditRevision = this.currentEditRevision = this.savedEditRevision = 0;
            },
            record(operation) {
                operation.beforeRevision = this.currentEditRevision;
                operation.afterRevision = isSelectionOperation(operation) ? this.currentEditRevision : ++this.nextEditRevision;
                this.currentEditRevision = operation.afterRevision;
                this.undoStack.push(operation);
                this.redoStack = [];
                if (this.undoStack.length > limit) this.undoStack.shift();
            },
            completeUndo(operation, state) {
                this.redoStack.push({ operation, state });
                this.currentEditRevision = operation.beforeRevision;
            },
            completeRedo(operation) {
                this.undoStack.push(operation);
                this.currentEditRevision = operation.afterRevision;
            },
            markSaved() { this.savedEditRevision = this.currentEditRevision; },
            get dirty() { return this.currentEditRevision !== this.savedEditRevision; }
        };
        return history;
    }
    const api = { createHistory, isSelectionOperation };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalHistory = api;
})(globalThis);
