const { test } = require('node:test');
const assert = require('node:assert/strict');
const { placeLabels } = require(process.env.CRYSTAL_ANNOTATIONS_CANDIDATE || '../annotations.js');

function bond(a, b, radius = 5) {
    return { x: (a.x+b.x)/2, y: (a.y+b.y)/2,
        width: Math.abs(a.x-b.x)+2*radius, height: Math.abs(a.y-b.y)+2*radius, segment: { a, b, radius } };
}
const viewport = { width: 600, height: 600 };
const label = { x: 300, y: 300, width: 80, height: 20 };

test('captions clear horizontal and vertical bond strokes with minimal displacement', () => {
    const horizontal = bond({x:100,y:300}, {x:500,y:300});
    const vertical = bond({x:300,y:100}, {x:300,y:500});
    const [h] = placeLabels([label], [horizontal], viewport);
    const [v] = placeLabels([label], [vertical], viewport);
    assert.ok(Math.abs(h.y-300) >= 19); assert.equal(h.x,300);
    assert.ok(Math.abs(v.x-300) >= 49); assert.equal(v.y,300);
});

test('diagonal bond bounding boxes do not block empty corners', () => {
    const diagonal = bond({x:100,y:100}, {x:500,y:500});
    const offAxis = {...label,x:170,y:430};
    assert.deepEqual(placeLabels([offAxis], [diagonal], viewport), [offAxis]);
    const [placed] = placeLabels([label], [diagonal], viewport);
    assert.ok(Math.abs(placed.x-placed.y) > 60);
});

test('end-on and endpoint bond projections still obstruct captions', () => {
    const endOn = bond({x:300,y:300}, {x:300,y:300});
    const endpoint = bond({x:300,y:300}, {x:500,y:300});
    for (const obstacle of [endOn, endpoint]) {
        const [placed] = placeLabels([label], [obstacle], viewport);
        assert.notDeepEqual(placed,label);
        assert.ok(Math.abs(placed.y-300)>=19 || Math.abs(placed.x-300)>=49);
        assert.deepEqual(placeLabels([label], [obstacle], viewport), [placed]);
    }
});

test('bond avoidance preserves inputs and accounts for previously placed captions', () => {
    const obstacles = [bond({x:100,y:300},{x:500,y:300})];
    const labels = [label,{...label}]; const original=JSON.stringify({labels,obstacles});
    const [first,second]=placeLabels(labels,obstacles,viewport);
    assert.ok(Math.abs(first.x-second.x)>=84 || Math.abs(first.y-second.y)>=24);
    assert.equal(JSON.stringify({labels,obstacles}),original);
});
