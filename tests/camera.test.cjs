const test = require('node:test');
const assert = require('node:assert/strict');
const THREE = require('three');
const { POLICY, createMath, createController } = require('../camera.js');
const math = createMath(THREE);
const cubic = [[10, 0, 0], [0, 10, 0], [0, 0, 10]];
const axes = math.axes(cubic);
const q = angle => math.orientation([Math.cos(math.radians(angle)), Math.sin(math.radians(angle)), 0], [0, 0, 1]);
const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

function rig(reduced = false) {
    let pose = { quaternion: q(10), pivot: new THREE.Vector3(4, -3, 2), distance: 40, zoom: 0.6 };
    const events = [], motion = [];
    const controller = createController({ math, getPose: () => pose, applyPose: value => { pose = value; }, clearMotion: () => motion.push('cleared'), getAxes: () => axes,
        reducedMotion: () => reduced, onStart: kind => events.push(`start:${kind}`), onComplete: kind => events.push(`end:${kind}`) });
    return { controller, events, motion, get pose() { return pose; }, setAngle: angle => { pose.quaternion = q(angle); } };
}

test('layout resize preserves camera intent and cannot be overwritten by a running alignment', () => {
    const r = rig();
    r.setAngle(4);
    const pivot = r.pose.pivot.toArray();
    r.controller.align(q(0), 0, 'automatic');
    r.controller.tick(40);
    const orientation = r.pose.quaternion.toArray();
    r.controller.resizeView({ zoom: .25, distance: 2 });
    close(r.pose.zoom, .15); close(r.pose.distance, 80);
    assert.deepEqual(r.pose.pivot.toArray(), pivot);
    assert.deepEqual(r.pose.quaternion.toArray(), orientation);
    assert.equal(r.controller.phase, 'transition');
    r.controller.tick(1000);
    close(r.pose.zoom, .15); close(r.pose.distance, 80);
    assert.deepEqual(r.pose.pivot.toArray(), pivot);
    r.controller.resizeView({ zoom: 4, distance: .5 });
    close(r.pose.zoom, .6); close(r.pose.distance, 40);
    assert.throws(() => r.controller.resizeView({ zoom: 0 }), /Invalid camera resize/);
});

test('axis capture depends on angle, including boundaries, not lattice proportions', () => {
    const elongated = math.axes([[5, 0, 0], [0, 5, 0], [0, 0, 100]]);
    assert.equal(math.nearestAxis(q(30), elongated), null);
    assert.equal(math.nearestAxis(q(5), elongated).name, '+a');
    assert.equal(math.nearestAxis(q(5.001), elongated), null);
    assert.equal(math.nearestAxis(q(180), axes).name, '-a');
    assert.deepEqual(math.axes([[0, 0, 0], [0, 1, 0], [0, 0, 1]]), []);
});

test('orthonormal bases and canonical rolls remain finite for skewed and nearly parallel references', () => {
    for (const up of [[1e-12, 0, 1], [0, 0, 1], [Math.sin(Math.PI / 18), 0, Math.cos(Math.PI / 18)]]) {
        const axis = { direction: new THREE.Vector3(0, 0, 1), up: new THREE.Vector3(...up) };
        const frames = Array.from({ length: 8 }, (_, index) => math.canonical(axis, index * 45));
        frames.forEach(frame => {
            assert.ok(frame.toArray().every(Number.isFinite));
            close(frame.length(), 1);
            const vertical = new THREE.Vector3(0, 1, 0).applyQuaternion(frame);
            close(vertical.dot(axis.direction), 0);
            close(math.back(frame).dot(axis.direction), 1);
        });
        frames.forEach((frame, index) => close(math.degrees(math.angularDistance(frame, frames[(index + 1) % 8])), 45));
    }
});

test('automatic direction and optional roll corrections share a hard total-angle budget', () => {
    for (const angle of [0, 1, 4, 5]) for (const roll of [0, 2, 4, 22, 89, 180, 359]) {
        const base = q(angle);
        const start = new THREE.Quaternion().setFromAxisAngle(math.back(base), math.radians(roll)).multiply(base);
        const target = math.automaticOrientation(start, axes[0]);
        assert.ok(target);
        assert.ok(math.degrees(math.angularDistance(start, target)) <= 5 + 1e-9);
        close(math.back(target).angleTo(axes[0].direction), 0, 1e-7);
    }
    assert.equal(math.automaticOrientation(q(6), axes[0]), null);
});

test('candidate hysteresis retains equivalent axes while ambiguous distinct axes do not capture', () => {
    const tilted = angle => [Math.cos(math.radians(angle)), Math.sin(math.radians(angle)), 0];
    const distinct = math.axes([tilted(0), tilted(4), [0, 0, 10]]);
    assert.equal(math.nearestAxis(q(2), distinct), null);
    assert.equal(math.nearestAxis(q(2.05), distinct, '+a').name, '+a');
    assert.equal(math.nearestAxis(q(3), distinct, '+a').name, '+b');
    const parallel = math.axes([tilted(0), tilted(0.01), [0, 0, 10]]);
    const first = math.nearestAxis(q(0), parallel).name;
    assert.equal(math.nearestAxis(q(0.01), parallel, first).name, first);
});

test('only meaningful approaching rotations snap; zoom, pan, clicks, departing and ambiguous jitter retain views', () => {
    for (const kind of ['rotate', 'zoom', 'pan']) {
        const r = rig();
        r.controller.begin(kind, 0);
        r.setAngle(3); r.controller.tick(100); r.controller.end(100);
        for (const time of [120, 200, 260, 600]) r.controller.tick(time);
        assert.equal(r.events.includes('end:automatic'), kind === 'rotate');
    }
    for (const sequence of [[2, 3], [3, 3], [3, 3.01, 2.99, 3]]) {
        const r = rig(); r.setAngle(sequence[0]); r.controller.begin('rotate', 0);
        sequence.slice(1).forEach((angle, index) => { r.setAngle(angle); r.controller.tick((index + 1) * 50); });
        r.controller.end(200);
        for (const time of [220, 400, 800]) r.controller.tick(time);
        assert.deepEqual(r.events, []);
    }
});

test('settling uses angular speed and continuous elapsed time, and candidates outside the cone are rechecked', () => {
    const r = rig(); r.controller.begin('rotate', 0); r.setAngle(4); r.controller.tick(100); r.controller.end(100);
    r.setAngle(3.9); r.controller.tick(150); // 2 degrees/second, still moving.
    assert.equal(r.controller.transitioning, false);
    r.controller.tick(200); r.controller.tick(319);
    assert.equal(r.controller.transitioning, false);
    r.setAngle(6); r.controller.tick(320); r.controller.tick(600);
    assert.equal(r.controller.transitioning, false);
    r.setAngle(3); r.controller.tick(700); r.controller.tick(750); r.controller.tick(871);
    assert.equal(r.controller.transitioning, true);
});

test('equivalent timestamped movement settles and aligns consistently at 30, 60 and 120 Hz', () => {
    for (const fps of [30, 60, 120]) {
        const r = rig(); r.controller.begin('rotate', 0);
        for (let time = 0; time <= 500; time += 1000 / fps) {
            r.setAngle(10 - 7 * Math.min(1, time / 300)); r.controller.tick(time);
        }
        r.setAngle(3); r.controller.end(500);
        for (let time = 500; time < 1500; time += 1000 / fps) r.controller.tick(time);
        assert.deepEqual(r.events, ['start:automatic', 'end:automatic']);
        close(math.angularDistance(r.pose.quaternion, q(0)), 0);
    }
});

test('transitions preserve pivot, radius and zoom, clear motion, and never survive cancellation', () => {
    const r = rig(); const original = math.clonePose(r.pose);
    r.controller.align(math.canonical(axes[5]), 0, 'explicit', '-c');
    r.controller.tick(150);
    close(math.position(r.pose).distanceTo(original.pivot), 40);
    assert.deepEqual(r.pose.pivot.toArray(), original.pivot.toArray()); close(r.pose.zoom, original.zoom);
    r.controller.cancel(); const interrupted = r.pose.quaternion.clone(); r.controller.tick(1000);
    close(math.angularDistance(interrupted, r.pose.quaternion), 0);
    assert.deepEqual(r.events, ['start:explicit']);
    assert.equal(r.motion.length, 2);
    assert.equal(r.controller.align(q(40), 1200, 'automatic'), false);
});

test('reduced motion finishes exactly and Auto Snap off suppresses pending corrections', () => {
    const instant = rig(true); instant.controller.align(q(0), 0);
    close(math.angularDistance(instant.pose.quaternion, q(0)), 0);
    assert.equal(instant.controller.transitioning, false);
    const r = rig(); r.controller.begin('rotate', 0); r.setAngle(3); r.controller.tick(100); r.controller.end(100);
    r.controller.autoSnap = false; r.controller.cancel(); r.controller.tick(1000);
    assert.deepEqual(r.events, []);
});

test('projection-aware fitting and clipping include every bound corner in narrow and large scenes', () => {
    for (const side of [1, 10, 500]) for (const aspect of [0.2, 0.5, 1, 2]) for (const fov of [null, 50]) {
        const bounds = new THREE.Box3(new THREE.Vector3(-side / 2, -side / 2, -side / 2), new THREE.Vector3(side / 2, side / 2, side / 2));
        const frame = math.orientation([1, 0.8, 1], [0, 1, 0]);
        const fitted = math.fit(bounds, frame, aspect, 15, fov);
        const camera = fov === null ? new THREE.OrthographicCamera(-7.5 * aspect, 7.5 * aspect, 7.5, -7.5, fitted.near, fitted.far)
            : new THREE.PerspectiveCamera(fov, aspect, fitted.near, fitted.far);
        if (fov === null) camera.zoom = fitted.zoom;
        camera.position.copy(math.position(fitted)); camera.quaternion.copy(frame); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
        for (const x of [-side / 2, side / 2]) for (const y of [-side / 2, side / 2]) for (const z of [-side / 2, side / 2]) {
            const p = new THREE.Vector3(x, y, z).project(camera);
            assert.ok(Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 && Math.abs(p.z) <= 1, JSON.stringify({ side, aspect, fov, p }));
        }
    }
    close(POLICY.maxCorrectionDegrees, 5);
});

test('orthographic depth containment preserves screen positions and puts geometry ahead of picking rays', () => {
    const bounds = new THREE.Box3(new THREE.Vector3(-5,-1,-1),new THREE.Vector3(5,1,1));
    for(const angle of [0,45,90,180]) {
        const pose={quaternion:q(angle),pivot:new THREE.Vector3(2,.5,0),distance:2,zoom:.6};
        const camera=new THREE.OrthographicCamera(-7.5,7.5,7.5,-7.5,.0001,100);
        camera.position.copy(math.position(pose));camera.quaternion.copy(pose.quaternion);camera.zoom=pose.zoom;
        camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
        const original=bounds.max.clone().project(camera);
        pose.distance=math.orthographicDistance(bounds,pose);
        const planes=math.clipping(bounds,pose);
        camera.position.copy(math.position(pose));camera.near=planes.near;camera.far=planes.far;
        camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
        const projected=bounds.max.clone().project(camera);
        close(projected.x,original.x);close(projected.y,original.y);
        for(const x of [-5,5])for(const y of [-1,1])for(const z of [-1,1]) {
            const point=new THREE.Vector3(x,y,z);
            const depth=-point.clone().applyMatrix4(camera.matrixWorldInverse).z;
            assert.ok(depth>camera.near && depth<camera.far);
            assert.ok(Math.abs(point.project(camera).z)<=1);
        }
    }
});

test('recent reversal overrides earlier approach and settled ineligible views leave no pending work', () => {
    const r = rig(); r.controller.begin('rotate', 0);
    r.setAngle(1); r.controller.tick(100);
    r.setAngle(4); r.controller.tick(300); r.controller.end(300);
    r.controller.tick(320); r.controller.tick(500);
    assert.deepEqual(r.events, []);
    assert.equal(r.controller.phase, 'idle');
    r.setAngle(25); r.controller.begin('rotate', 600);
    r.setAngle(30); r.controller.tick(700); r.controller.end(700);
    r.controller.tick(720); r.controller.tick(841);
    assert.equal(r.controller.phase, 'idle');
    assert.deepEqual(r.events, []);
});

test('a changing candidate must independently complete its continuous stability interval', () => {
    const r = rig();
    const nearAxes = math.axes([[1, 0, 0], [Math.cos(math.radians(4)), Math.sin(math.radians(4)), 0], [0, 0, 1]]);
    let pose = math.clonePose(r.pose);
    const events = [];
    const controller = createController({ math, getPose: () => pose, applyPose: value => { pose = value; }, clearMotion() {}, getAxes: () => nearAxes, onStart: kind => events.push(kind) });
    controller.begin('rotate', 0); pose.quaternion = q(1); controller.tick(100); controller.end(100);
    controller.tick(120); controller.tick(200);
    pose.quaternion = q(3); controller.tick(220); // New +b candidate, still moving.
    controller.tick(240); controller.tick(359);
    assert.deepEqual(events, []);
    controller.tick(361);
    assert.deepEqual(events, ['automatic']);
});

test('instant camera actions cancel movement, clear controls and copy the requested pose', () => {
    const r = rig(); r.controller.align(q(0), 0); r.controller.tick(100);
    const target = { ...math.clonePose(r.pose), pivot: new THREE.Vector3(1, 2, 3), zoom: 2 };
    r.controller.setPose(target, 'focus');
    r.controller.tick(1000);
    assert.equal(r.controller.phase, 'idle');
    assert.deepEqual(r.pose.pivot.toArray(), [1, 2, 3]);
    close(r.pose.zoom, 2);
    close(math.angularDistance(r.pose.quaternion, target.quaternion), 0);
    target.pivot.x = 99;
    close(r.pose.pivot.x, 1);
    assert.deepEqual(r.events, ['start:explicit', 'start:focus', 'end:focus']);
    assert.equal(r.motion.length, 3);
});

test('slow approach and holding before release retain intent at any zoom or distance', () => {
    for (const zoom of [.2, 1, 25]) for (const distance of [2, 40, 500]) {
        for (const [duration, angleAt] of [
            [2000, t => .4 + 9.6 * Math.exp(-t / 120)], // Damping tail.
            [8000, t => 10 - 7 * Math.min(t / 8000, 1)] // Slow precise rotation.
        ]) {
            const r = rig(); r.pose.zoom = zoom; r.pose.distance = distance;
            r.controller.begin('rotate', 0);
            // The last 150 ms contain less than .25° of approach. A pause
            // before release must retain the whole terminal movement's intent.
            for (let t = 20; t <= duration + 1000; t += 20) {
                r.setAngle(angleAt(Math.min(t, duration)));
                r.controller.tick(t);
            }
            r.controller.end(duration + 1000);
            for (const offset of [1020, 1200, 1600]) r.controller.tick(duration + offset);
            assert.deepEqual(r.events, ['start:automatic', 'end:automatic']);
            close(math.angularDistance(r.pose.quaternion, q(0)), 0);
            close(r.pose.zoom, zoom); close(r.pose.distance, distance);
        }
    }
});

test('inertial overshoot retains manual approach but cannot expand the capture cone', () => {
    for (const angle of [-1, -6]) {
        const r = rig(); r.controller.begin('rotate', 0);
        r.setAngle(.1); r.controller.tick(100); r.controller.end(100, false);
        r.setAngle(angle); r.controller.tick(200, false);
        for (const time of [320, 500, 900]) r.controller.tick(time, false);
        assert.equal(r.events.includes('end:automatic'), angle === -1);
    }
});

test('inertia while holding the pointer cannot erase approach, and release delay does not change capture', () => {
    for (const held of [false, true]) {
        const r = rig(); r.controller.begin('rotate', 0);
        r.setAngle(7); r.controller.tick(100, true);
        if (!held) r.controller.end(100, false);
        r.setAngle(.1); r.controller.tick(300, false);
        r.setAngle(-.6); r.controller.tick(500, false);
        if (held) r.controller.end(600, false);
        for (const time of [700, 900, 1300]) r.controller.tick(time, false);
        assert.deepEqual(r.events, ['start:automatic', 'end:automatic']);
        close(math.angularDistance(r.pose.quaternion, q(0)), 0);
    }
});

test('deliberate departure uses the current pose even after a large inertial approach', () => {
    const r = rig(); r.controller.begin('rotate', 0);
    r.setAngle(7); r.controller.tick(100, true);
    r.setAngle(.4); r.controller.tick(200, false); // Inertia must not count as manual approach.
    r.setAngle(1); r.controller.tick(300, true); // Explicit .6° movement away.
    r.controller.end(300, false);
    for (const time of [320, 500, 900]) r.controller.tick(time, false);
    assert.deepEqual(r.events, []);
    close(math.angularDistance(r.pose.quaternion, q(1)), 0);
});

test('damping with no actual rotation input cannot create a snap gesture', () => {
    const r = rig(); r.controller.begin('rotate', 0);
    r.setAngle(3); r.controller.tick(100, false);
    r.controller.end(100, false);
    for (const time of [320, 500, 900]) r.controller.tick(time, false);
    assert.deepEqual(r.events, []);
});
