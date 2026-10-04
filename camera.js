// Deterministic camera math and action policy; no DOM or renderer dependencies.
(function (root) {
    const POLICY = Object.freeze({
        maxCorrectionDegrees: 5,
        settledSpeedDegrees: 1,
        settledMilliseconds: 120,
        tieDegrees: 0.25,
        intentNoiseDegrees: 0.25,
        meaningfulDegrees: 0.25,
        historyMilliseconds: 150,
        durationMilliseconds: 300,
        fitPadding: 1.15,
        controlsStepMilliseconds: 1000 / 60
    });

    function createMath(THREE) {
        const radians = degrees => degrees * Math.PI / 180;
        const degrees = angle => angle * 180 / Math.PI;
        const vector = value => value?.isVector3 ? value.clone() : new THREE.Vector3(...value);
        function unit(value) {
            const result = vector(value);
            const length = Math.hypot(result.x, result.y, result.z);
            if (!Number.isFinite(length) || length <= 0 || !Number.isFinite(1 / length)) throw new Error('Invalid camera direction');
            return result.multiplyScalar(1 / length);
        }
        const back = quaternion => new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
        function angularDistance(first, second) {
            const delta = first.clone().invert().multiply(second).normalize();
            return 2 * Math.atan2(Math.hypot(delta.x, delta.y, delta.z), Math.abs(delta.w));
        }
        function orientation(direction, referenceUp) {
            const z = unit(direction);
            let up = unit(referenceUp);
            up.addScaledVector(z, -up.dot(z));
            if (up.length() < 1e-6) {
                const alternatives = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(unit);
                alternatives.sort((a, b) => Math.abs(a.dot(z)) - Math.abs(b.dot(z)));
                up = alternatives[0].addScaledVector(z, -alternatives[0].dot(z));
            }
            up.normalize();
            const right = new THREE.Vector3().crossVectors(up, z).normalize();
            up.crossVectors(z, right).normalize();
            return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, z)).normalize();
        }
        function axes(lattice) {
            if (!Array.isArray(lattice) || lattice.length !== 3) return [];
            try {
                const directions = lattice.map(unit);
                const names = ['a', 'b', 'c'];
                return directions.flatMap((direction, index) => [1, -1].map(sign => ({
                    name: `${sign > 0 ? '+' : '-'}${names[index]}`,
                    direction: direction.clone().multiplyScalar(sign),
                    up: directions[index === 2 ? 1 : 2].clone()
                })));
            } catch { return []; }
        }
        function canonical(axis, roll = 0) {
            const quaternion = orientation(axis.direction, axis.up);
            return new THREE.Quaternion().setFromAxisAngle(axis.direction, radians(roll)).multiply(quaternion).normalize();
        }
        function nearestAxis(quaternion, candidates, previousName, policy = POLICY) {
            const from = back(quaternion);
            const eligible = candidates.map(axis => ({ ...axis, angle: from.angleTo(axis.direction) }))
                .filter(axis => axis.angle <= radians(policy.maxCorrectionDegrees) + 1e-12)
                .sort((a, b) => a.angle - b.angle || candidates.findIndex(axis => axis.name === a.name) - candidates.findIndex(axis => axis.name === b.name));
            if (!eligible.length) return null;
            const margin = radians(policy.tieDegrees);
            const previous = eligible.find(axis => axis.name === previousName && axis.angle <= eligible[0].angle + margin);
            if (previous) return previous;
            // Equivalent near-parallel directions have a deterministic representative.
            // A new tie between distinct directions gives no evidence of user intent.
            if (eligible[1] && eligible[1].angle - eligible[0].angle <= margin
                && eligible[0].direction.angleTo(eligible[1].direction) > margin) return null;
            return eligible[0];
        }
        function automaticOrientation(quaternion, axis, policy = POLICY) {
            const swing = new THREE.Quaternion().setFromUnitVectors(back(quaternion), axis.direction);
            const aligned = swing.multiply(quaternion).normalize();
            let result = aligned;
            let rollDistance = Infinity;
            for (let roll = 0; roll < 360; roll += 45) {
                const target = canonical(axis, roll);
                const total = angularDistance(quaternion, target);
                const correction = angularDistance(aligned, target);
                if (total <= radians(policy.maxCorrectionDegrees) + 1e-12 && correction < rollDistance) {
                    result = target;
                    rollDistance = correction;
                }
            }
            if (angularDistance(quaternion, result) > radians(policy.maxCorrectionDegrees) + 1e-12) return null;
            return result;
        }
        const clonePose = pose => ({ quaternion: pose.quaternion.clone(), pivot: pose.pivot.clone(), distance: pose.distance, zoom: pose.zoom });
        function interpolate(start, target, fraction) {
            const pose = clonePose(start);
            pose.quaternion.slerp(target, Math.max(0, Math.min(1, fraction))).normalize();
            return pose;
        }
        function position(pose) { return pose.pivot.clone().addScaledVector(back(pose.quaternion), pose.distance); }
        function corners(bounds) {
            if (bounds.isEmpty()) return [new THREE.Vector3()];
            const result = [];
            for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) result.push(new THREE.Vector3(x, y, z));
            return result;
        }
        function clipping(bounds, pose) {
            const direction = back(pose.quaternion);
            const depths = corners(bounds).map(point => pose.distance - point.sub(pose.pivot).dot(direction));
            const min = Math.min(...depths), max = Math.max(...depths);
            return { near: Math.max(0.0001, min > 0 ? min * 0.5 : 0.0001), far: Math.max(1, max * 1.25) };
        }
        function fit(bounds, quaternion, aspect, frustumHeight = 15, fov = null, padding = POLICY.fitPadding) {
            if (!(aspect > 0) || !Number.isFinite(aspect)) throw new Error('Invalid camera viewport');
            const pivot = bounds.getCenter(new THREE.Vector3());
            const inverse = quaternion.clone().invert();
            const points = corners(bounds).map(point => point.sub(pivot).applyQuaternion(inverse));
            const x = Math.max(0.5, ...points.map(point => Math.abs(point.x)));
            const y = Math.max(0.5, ...points.map(point => Math.abs(point.y)));
            const radius = Math.max(0.5, ...points.map(point => point.length()));
            let distance = radius * 2.5 + 1;
            if (fov !== null) {
                const tan = Math.tan(radians(fov / 2));
                distance = Math.max(distance, ...points.flatMap(point => [point.z + Math.abs(point.x) * padding / (tan * aspect), point.z + Math.abs(point.y) * padding / tan]));
            }
            const pose = { pivot, quaternion: quaternion.clone(), distance,
                zoom: fov === null ? frustumHeight / (2 * padding * Math.max(y, x / aspect)) : 1 };
            if (![distance, pose.zoom, ...pivot.toArray()].every(Number.isFinite)) throw new Error('Structure cannot be fitted to a finite camera view');
            return { ...pose, ...clipping(bounds, pose) };
        }
        return { radians, degrees, unit, back, angularDistance, orientation, axes, canonical, nearestAxis, automaticOrientation, clonePose, interpolate, position, fit, clipping };
    }

    // The adapter owns Three.js objects and controls; this controller owns decisions
    // and transitions. tick() is driven by the app's sole animation loop.
    function createController({ math, getPose, applyPose, clearMotion, getAxes, reducedMotion = () => false,
        onStart = () => {}, onComplete = () => {}, policy = POLICY }) {
        let revision = 0, gesture = null, pending = null, transition = null;
        let previousSample = null;
        const controller = {
            autoSnap: true,
            get phase() { return transition ? 'transition' : gesture ? 'gesture' : pending ? 'settling' : 'idle'; },
            get interacting() { return Boolean(gesture); },
            get transitioning() { return Boolean(transition); },
            get settling() { return Boolean(pending); },
            cancel() {
                revision++;
                const wasTransition = Boolean(transition);
                gesture = pending = transition = previousSample = null;
                if (wasTransition) clearMotion();
            },
            begin(kind, time) {
                this.cancel();
                const pose = math.clonePose(getPose());
                gesture = { kind, start: pose.quaternion, maxMotion: 0, samples: [{ time, quaternion: pose.quaternion.clone() }] };
                previousSample = { time, quaternion: pose.quaternion.clone() };
            },
            sample(time) {
                const pose = getPose();
                const speed = previousSample && time > previousSample.time
                    ? math.degrees(math.angularDistance(previousSample.quaternion, pose.quaternion)) * 1000 / (time - previousSample.time) : Infinity;
                previousSample = { time, quaternion: pose.quaternion.clone() };
                if (gesture?.kind === 'rotate') {
                    gesture.maxMotion = Math.max(gesture.maxMotion, math.degrees(math.angularDistance(gesture.start, pose.quaternion)));
                    const last = gesture.samples[gesture.samples.length - 1];
                    if (math.degrees(math.angularDistance(last.quaternion, pose.quaternion)) > 0.02) {
                        gesture.samples.push({ time, quaternion: pose.quaternion.clone() });
                        if (gesture.samples.length > 120) gesture.samples.shift();
                    }
                }
                return { pose, speed };
            },
            end(time) {
                if (!gesture) return;
                this.sample(time);
                if (gesture.kind === 'rotate' && gesture.maxMotion >= policy.meaningfulDegrees && this.autoSnap) {
                    const samples = gesture.samples;
                    const last = samples[samples.length - 1];
                    const recent = samples.filter(sample => sample.time >= last.time - policy.historyMilliseconds);
                    // Keep the start of the terminal movement while inertia settles.
                    const reference = recent.length > 1 ? recent[0] : samples[Math.max(0, samples.length - 2)];
                    pending = { reference: reference.quaternion.clone(), candidate: null, stableAt: null, quietAt: null };
                }
                gesture = null;
            },
            align(quaternion, time, kind = 'explicit', name = '') {
                const start = math.clonePose(getPose());
                if (kind === 'automatic' && math.angularDistance(start.quaternion, quaternion) > math.radians(policy.maxCorrectionDegrees) + 1e-12) return false;
                this.cancel();
                clearMotion();
                transition = { start, target: quaternion.clone().normalize(), startedAt: time, revision, kind, name };
                onStart(kind);
                if (reducedMotion()) this.tick(time);
                return true;
            },
            setPose(pose, kind) {
                this.cancel();
                onStart(kind);
                applyPose(math.clonePose(pose));
                clearMotion();
                onComplete(kind, '');
            },
            tick(time) {
                if (transition) {
                    const current = transition;
                    if (current.revision !== revision) return;
                    const progress = reducedMotion() ? 1 : Math.min(1, Math.max(0, (time - current.startedAt) / policy.durationMilliseconds));
                    applyPose(math.interpolate(current.start, current.target, 1 - (1 - progress) ** 3));
                    if (progress === 1) {
                        transition = null;
                        previousSample = null;
                        onComplete(current.kind, current.name);
                    }
                    return;
                }
                const { pose, speed } = this.sample(time);
                if (!pending || !this.autoSnap) return;
                if (speed < policy.settledSpeedDegrees) {
                    if (pending.quietAt === null) pending.quietAt = time;
                } else pending.quietAt = null;
                const axis = math.nearestAxis(pose.quaternion, getAxes(), pending.candidate, policy);
                if (!axis) {
                    pending.candidate = pending.stableAt = null;
                    if (pending.quietAt !== null && time - pending.quietAt >= policy.settledMilliseconds) pending = null;
                    return;
                }
                if (axis.name !== pending.candidate) {
                    pending.candidate = axis.name;
                    pending.stableAt = time;
                }
                if (pending.quietAt === null || time - pending.quietAt < policy.settledMilliseconds || time - pending.stableAt < policy.settledMilliseconds) return;
                const approach = math.degrees(math.back(pending.reference).angleTo(axis.direction) - math.back(pose.quaternion).angleTo(axis.direction));
                if (approach <= policy.intentNoiseDegrees) { pending = null; return; }
                const target = math.automaticOrientation(pose.quaternion, axis, policy);
                if (target && math.angularDistance(pose.quaternion, target) > 1e-6) this.align(target, time, 'automatic', axis.name);
                else pending = null;
            }
        };
        return controller;
    }
    const api = { POLICY, createMath, createController };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalCamera = api;
})(globalThis);
