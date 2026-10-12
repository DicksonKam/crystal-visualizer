const test = require('node:test');
const assert = require('node:assert/strict');
const { cellDragPlaneNormal, cellPlaneSection, fractionalToCartesian, cartesianToFractional } = require(process.env.CRYSTAL_GEOMETRY_CANDIDATE || '../geometry.js');
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot = (a,b) => a.reduce((sum,x,i)=>sum+x*b[i],0);
const normalize = a => a.map(x=>x/Math.hypot(...a));

for (const [name,cell] of [['cube',[[4,0,0],[0,4,0],[0,0,4]]],['skew',[[4,.5,.2],[1,5,.4],[.3,.8,6]]]]) {
    test(`${name} tangent corner drags have bounded movement area at every corner and cell scale`,()=>{
        for (const size of [1e-6,1,1e6]) {
            const lattice = cell.map(row=>row.map(x=>x*size));
            for (let corner=0;corner<8;corner++) {
                const fractions = [0,1,2].map(axis=>Number(Boolean(corner&(1<<axis))));
                const origin = fractionalToCartesian(fractions,lattice);
                const facing = [0,0,0];
                for (let axis=0;axis<3;axis++) {
                    const other=[0,1,2].filter(i=>i!==axis);
                    const n=normalize(cross(lattice[other[0]],lattice[other[1]]));
                    const sign=dot(n,lattice[axis])>0?1:-1;
                    n.forEach((x,i)=>facing[i]+=x*sign*(fractions[axis]?1:-1));
                }
                assert.equal(cellPlaneSection(lattice,origin,facing).length,1);
                const normal=cellDragPlaneNormal(lattice,origin,facing);
                const section=cellPlaneSection(lattice,origin,normal);
                assert.equal(section.length,4);
                assert.ok(Math.abs(dot(normal,normalize(facing)))>.1);
                for (const point of section) {
                    assert.ok(Math.abs(dot(normal,point.map((x,i)=>x-origin[i])))<size*1e-8);
                    for (const x of cartesianToFractional(point.map(x=>x/size),cell)) assert.ok(x>=-1e-8&&x<=1+1e-8);
                }
            }
        }
    });
    test(`${name} ordinary interior and boundary-face planes retain their camera normal`,()=>{
        for (const [fraction,facing] of [[[.5,.5,.5],[1,1,1]],[[0,.5,.5],cross(cell[1],cell[2])]]) {
            const origin=fractionalToCartesian(fraction,cell);
            const actual=cellDragPlaneNormal(cell,origin,facing),expected=normalize(facing);
            assert.ok(Math.hypot(...actual.map((x,i)=>x-expected[i]))<1e-14);
        }
    });
}

test('tangent edge acquires a full movement plane; outside anchor stays unchanged',()=>{
    const lattice=[[4,0,0],[0,4,0],[0,0,4]],facing=[1,1,0];
    const normal=cellDragPlaneNormal(lattice,[0,0,2],facing);
    assert.equal(cellPlaneSection(lattice,[0,0,2],normal).length,4);
    assert.deepEqual(cellDragPlaneNormal(lattice,[-2,-2,-2],facing),normalize(facing));
});
