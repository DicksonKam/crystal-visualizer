const assert = require('node:assert/strict');
const test = require('node:test');
const { createHistory } = require('../history.js');

test('history tracks saved revisions across edits, selection, undo, redo and branching', () => {
    const history = createHistory();
    const move = { type: 'move_atom' };
    history.record(move);
    assert.equal(history.dirty, true);
    history.markSaved();
    const selection = { type: 'select_atom' };
    history.record(selection);
    assert.equal(history.dirty, false);
    history.completeUndo(history.undoStack.pop(), {});
    assert.equal(history.dirty, false);
    history.completeUndo(history.undoStack.pop(), {});
    assert.equal(history.dirty, true);
    const redo = history.redoStack.pop();
    history.completeRedo(redo.operation);
    assert.equal(history.dirty, false);
    const another = { type: 'shift_atoms' };
    history.record(another);
    assert.equal(another.afterRevision, 2);
    assert.equal(history.redoStack.length, 0);
    history.reset();
    assert.equal(history.dirty, false);
    assert.equal(history.undoStack.length, 0);
    assert.equal(history.redoStack.length, 0);
});

test('history bounds retained operations without reusing revision identities', () => {
    const history = createHistory(2);
    for (let i = 0; i < 5; i++) history.record({ type: 'move_atom' });
    assert.equal(history.undoStack.length, 2);
    assert.equal(history.undoStack[0].afterRevision, 4);
    assert.equal(history.currentEditRevision, 5);
    assert.throws(() => createHistory(0), /positive integer/);
});
