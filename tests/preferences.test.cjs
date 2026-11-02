const assert = require('node:assert/strict');
const test = require('node:test');
const CrystalPreferences = require('../preferences.js');

const defaults = { atomScale: 0.8, bondThreshold: 2.5, showLabels: false, background: '#0a0a0f', colors: { Mo: '#b386b0' } };

function memoryStorage(initial = {}) {
    const items = new Map(Object.entries(initial));
    return {
        items,
        getItem: key => (items.has(key) ? items.get(key) : null),
        setItem: (key, value) => { items.set(key, String(value)); },
        removeItem: key => { items.delete(key); }
    };
}

function store(storage) {
    return CrystalPreferences.createStore({ key: 'prefs', storage, defaults });
}

test('load returns the defaults when nothing is stored, as a copy', () => {
    const prefs = store(memoryStorage()).load();
    assert.deepEqual(prefs, defaults);
    prefs.colors.Mo = '#000000';
    assert.equal(defaults.colors.Mo, '#b386b0');
});

test('save keeps only the differences and load merges them over the defaults', () => {
    const storage = memoryStorage();
    const prefs = store(storage);
    prefs.save({ ...defaults, atomScale: 1.2, showLabels: true, colors: { Mo: '#b386b0' } });
    assert.deepEqual(JSON.parse(storage.getItem('prefs')), { version: 1, values: { atomScale: 1.2, showLabels: true } });
    assert.deepEqual(prefs.load(), { ...defaults, atomScale: 1.2, showLabels: true });
});

test('saving the defaults again forgets the stored entry', () => {
    const storage = memoryStorage();
    const prefs = store(storage);
    prefs.save({ ...defaults, atomScale: 1.2 });
    prefs.save({ ...defaults });
    assert.equal(storage.getItem('prefs'), null);
});

test('unknown keys and values of the wrong kind are ignored', () => {
    const storage = memoryStorage({ prefs: JSON.stringify({ version: 1, values: {
        atomScale: 'big', bondThreshold: NaN, showLabels: 1, background: '#ffffff', colors: { Mo: 7, Te: '#ada251' }, periodic: { a: 3 }, __proto__: { x: 1 }
    } }) });
    assert.deepEqual(store(storage).load(), { ...defaults, background: '#ffffff' });
});

test('a damaged or foreign entry falls back to the defaults', () => {
    for (const raw of ['{not json', '42', '"text"', JSON.stringify({ values: [1, 2] }), JSON.stringify([])]) {
        assert.deepEqual(store(memoryStorage({ prefs: raw })).load(), defaults, raw);
    }
});

test('a missing or failing storage still loads, saves and resets', () => {
    assert.deepEqual(store(null).load(), defaults);
    store(null).save({ ...defaults, atomScale: 2 });
    const failing = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); }, removeItem() { throw new Error('blocked'); } };
    assert.deepEqual(store(failing).load(), defaults);
    store(failing).save({ ...defaults, atomScale: 2 });
    assert.deepEqual(store(failing).reset(), defaults);
});

test('reset forgets the stored entry and returns fresh defaults', () => {
    const storage = memoryStorage();
    const prefs = store(storage);
    prefs.save({ ...defaults, showLabels: true });
    const reset = prefs.reset();
    assert.deepEqual(reset, defaults);
    assert.equal(storage.getItem('prefs'), null);
    reset.colors.Mo = '#000000';
    assert.equal(prefs.defaults.colors.Mo, '#b386b0');
});

test('serialize writes a readable style file and parse reads it back', () => {
    const prefs = store(memoryStorage());
    const text = prefs.serialize({ ...defaults, background: '#ffffff', colors: { Mo: '#ff0000' } });
    assert.match(text, /"app": "crystal-visualizer"/);
    assert.ok(text.endsWith('\n'));
    assert.deepEqual(JSON.parse(text).values, { background: '#ffffff', colors: { Mo: '#ff0000' } });
    assert.deepEqual(prefs.parse(text), { ...defaults, background: '#ffffff', colors: { Mo: '#ff0000' } });
});

test('parse rejects text that is not a style file', () => {
    const prefs = store(memoryStorage());
    for (const text of ['', 'Mo 1 0 0', '[]', JSON.stringify({ app: 'crystal-visualizer' }), JSON.stringify({ values: 3 })]) {
        assert.throws(() => prefs.parse(text), /not a style file/, JSON.stringify(text));
    }
    assert.deepEqual(prefs.parse(JSON.stringify({ values: { atomScale: 'x', showLabels: true } })), { ...defaults, showLabels: true });
});

test('an empty-object default is an open map of primitive values', () => {
    const open = { atomScale: 0.8, colors: {} };
    const storage = memoryStorage();
    const prefs = CrystalPreferences.createStore({ key: 'prefs', storage, defaults: open });
    prefs.save({ atomScale: 0.8, colors: { Mo: '#ff0000', Te: 7, On: true, X: { nested: 1 }, Nope: null, ['k'.repeat(40)]: 'long' } });
    assert.deepEqual(JSON.parse(storage.getItem('prefs')).values, { colors: { Mo: '#ff0000', Te: 7, On: true } });
    assert.deepEqual(prefs.load(), { atomScale: 0.8, colors: { Mo: '#ff0000', Te: 7, On: true } });
    prefs.save({ atomScale: 0.8, colors: {} });
    assert.equal(storage.getItem('prefs'), null);
    const hostile = prefs.parse(JSON.stringify({ values: { colors: { __proto__: 'x', constructor: 'y', Si: '#0000ff' } } }));
    assert.deepEqual(hostile.colors, { Si: '#0000ff' });
    assert.equal(Object.getPrototypeOf(hostile.colors), Object.prototype);
});
