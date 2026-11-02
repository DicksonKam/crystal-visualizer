// Preferences are presentation choices a visitor keeps between visits: the
// display options, and later the background and element colours. They live
// only in the visitor's own browser, as the differences from the defaults, so
// a missing or damaged entry falls back to the defaults and the app still
// starts. The loaded structure, camera and edits are never preferences.
(function (root) {
    const VERSION = 1;

    function isPlainObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    function clone(value) {
        return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
    }

    function sameShape(candidate, reference) {
        if (isPlainObject(reference)) return isPlainObject(candidate);
        if (Array.isArray(reference)) return Array.isArray(candidate);
        if (typeof reference === 'number') return typeof candidate === 'number' && Number.isFinite(candidate);
        return typeof candidate === typeof reference;
    }

    function equal(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    // An empty object as a default is an open map, such as colours keyed by
    // element symbol: any short key may appear, with a string, number or
    // boolean value.
    function isOpenMap(reference) {
        return isPlainObject(reference) && Object.keys(reference).length === 0;
    }

    const RESERVED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

    function sanitizeMap(candidate) {
        const result = {};
        if (!isPlainObject(candidate)) return result;
        for (const key of Object.keys(candidate)) {
            const value = candidate[key];
            if (RESERVED_KEYS.has(key) || key.length > 32) continue;
            if (typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) result[key] = value;
        }
        return result;
    }

    // Keep only the keys the defaults know, each with a value of the same
    // kind. Nested objects are filtered the same way, so an unknown or
    // malformed entry disappears instead of reaching the app.
    function sanitize(candidate, defaults) {
        const result = {};
        if (!isPlainObject(candidate)) return result;
        for (const key of Object.keys(defaults)) {
            if (!Object.hasOwn(candidate, key) || !sameShape(candidate[key], defaults[key])) continue;
            if (isOpenMap(defaults[key])) result[key] = sanitizeMap(candidate[key]);
            else result[key] = isPlainObject(defaults[key]) ? sanitize(candidate[key], defaults[key]) : clone(candidate[key]);
        }
        return result;
    }

    function merge(defaults, overrides) {
        const result = clone(defaults);
        for (const key of Object.keys(overrides)) {
            result[key] = isPlainObject(defaults[key]) ? merge(defaults[key], overrides[key]) : overrides[key];
        }
        return result;
    }

    function differences(values, defaults) {
        const result = {};
        for (const key of Object.keys(defaults)) {
            if (!Object.hasOwn(values, key)) continue;
            if (isOpenMap(defaults[key])) {
                const entries = sanitizeMap(values[key]);
                if (Object.keys(entries).length) result[key] = entries;
            } else if (isPlainObject(defaults[key])) {
                const nested = differences(values[key], defaults[key]);
                if (Object.keys(nested).length) result[key] = nested;
            } else if (!equal(values[key], defaults[key])) {
                result[key] = clone(values[key]);
            }
        }
        return result;
    }

    // storage is anything with getItem/setItem/removeItem (localStorage), or
    // null when the browser offers none; every storage call is guarded, so a
    // full or blocked storage only means nothing is remembered.
    function createStore({ key, storage = null, defaults }) {
        function readStored() {
            try {
                const raw = storage ? storage.getItem(key) : null;
                if (!raw) return {};
                const parsed = JSON.parse(raw);
                return sanitize(isPlainObject(parsed) ? parsed.values : null, defaults);
            } catch {
                return {};
            }
        }

        function load() {
            return merge(defaults, readStored());
        }

        function save(values) {
            const diff = differences(sanitize(values, defaults), defaults);
            try {
                if (!storage) return;
                if (Object.keys(diff).length) storage.setItem(key, JSON.stringify({ version: VERSION, values: diff }));
                else storage.removeItem(key);
            } catch { /* Optional: the app keeps working without memory. */ }
        }

        function reset() {
            try { if (storage) storage.removeItem(key); } catch { /* Optional. */ }
            return clone(defaults);
        }

        // A style file holds the same differences, readable by a person.
        function serialize(values) {
            return JSON.stringify({ app: 'crystal-visualizer', version: VERSION, values: differences(sanitize(values, defaults), defaults) }, null, 2) + '\n';
        }

        // Returns the full preference set described by a style file, or
        // throws with a message fit for the status bar.
        function parse(text) {
            let parsed;
            try { parsed = JSON.parse(text); } catch { throw new Error('This is not a style file'); }
            if (!isPlainObject(parsed) || !isPlainObject(parsed.values)) throw new Error('This is not a style file');
            return merge(defaults, sanitize(parsed.values, defaults));
        }

        return { load, save, reset, serialize, parse, defaults: clone(defaults) };
    }

    const api = { createStore, sanitize, differences, merge };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalPreferences = api;
})(globalThis);
