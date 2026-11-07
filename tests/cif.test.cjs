const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { createFormats } = require('../formats.js');
const { cartesianToFractional } = require('../geometry.js');
const documentModel = require('../document.js');

class Vector3 {
    constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); }
    clone() { return new Vector3(this.x, this.y, this.z); }
}

const formats = createFormats(Vector3, cartesianToFractional);
const read = relative => fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
const composition = structure => Object.fromEntries(structure.elements.map((element, index) => [element, structure.counts[index]]));
const length = vector => Math.hypot(...vector);
const angle = (first, second) => Math.acos(first.reduce((sum, value, axis) => sum + value * second[axis], 0) / (length(first) * length(second))) * 180 / Math.PI;
const sortedFractional = structure => structure.atoms.map(atom => atom.fractional.map(value => Number(value.toFixed(6)))).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

// Files from the Crystallography Open Database. Compositions follow Z and the
// stoichiometry each entry states, so a wrong operation or a missed duplicate
// changes the count.
const realFiles = [
    { file: 'examples/cif/ZnS_wurtzite.cif', composition: { Zn: 2, S: 2 }, spaceGroup: 'P 63 m c', number: 186, operations: 12, sites: 2 },
    { file: 'examples/cif/TiO2_rutile.cif', composition: { Ti: 2, O: 4 }, spaceGroup: 'P 42/m n m', number: 136, operations: 16, sites: 2 },
    { file: 'examples/cif/SiO2_quartz.cif', composition: { O: 6, Si: 3 }, spaceGroup: 'P 32 2 1', number: 154, operations: 6, sites: 2 },
    { file: 'examples/cif/vanthoffite_monoclinic.cif', composition: { Na: 12, Mg: 2, S: 8, O: 32 }, spaceGroup: 'P 1 21/c 1', number: 14, operations: 4, sites: 14 },
    { file: 'tests/fixtures/cif/NaCl_cod1000041.cif', composition: { Na: 4, Cl: 4 }, spaceGroup: 'F m -3 m', number: 225, operations: 192, sites: 2 },
    { file: 'tests/fixtures/cif/Si_cod9008566.cif', composition: { Si: 8 }, spaceGroup: 'F d -3 m :1', number: 227, operations: 192, sites: 1 },
    { file: 'tests/fixtures/cif/gibbsite_cod1011081.cif', composition: { Al: 8, O: 24 }, spaceGroup: 'P 1 21/n 1', number: 14, operations: 4, sites: 8 },
    { file: 'tests/fixtures/cif/graphite_cod9000046.cif', composition: { C: 8 }, spaceGroup: 'F m m m', number: 69, operations: 32, sites: 1 },
    { file: 'tests/fixtures/cif/polyisobutene_cod2300119.cif', composition: { C: 64, H: 128 }, spaceGroup: 'P 21 21 21', number: 19, operations: 4, sites: 48 }
];

for (const expected of realFiles) {
    test(`${path.basename(expected.file)} expands to ${JSON.stringify(expected.composition)}`, () => {
        const structure = formats.parseCIF(read(expected.file));
        assert.deepEqual(composition(structure), expected.composition);
        assert.equal(structure.isCIF, true);
        assert.equal(structure.cifInfo.spaceGroup, expected.spaceGroup);
        assert.equal(structure.cifInfo.spaceGroupNumber, expected.number);
        assert.equal(structure.cifInfo.operations, expected.operations);
        assert.equal(structure.cifInfo.sites, expected.sites);
        assert.deepEqual(structure.cifInfo.notices, []);
        assert.equal(structure.atoms.length, structure.counts.reduce((sum, count) => sum + count, 0));
        for (const atom of structure.atoms) {
            assert.ok(atom.fractional.every(value => value >= 0 && value < 1), `${atom.element} lies inside the cell`);
            assert.deepEqual(atom.selectiveDynamics, [true, true, true]);
            const back = cartesianToFractional(atom.position, structure.lattice);
            back.forEach((value, axis) => assert.ok(Math.abs(value - atom.fractional[axis]) < 1e-9));
        }
        assert.ok(structure.speciesGroups.length === structure.elements.length);
        assert.ok(structure.atoms.every(atom => structure.speciesGroups.some(group => group.id === atom.speciesId && group.element === atom.element)));
    });
}

test('cell parameters become a conventional lattice with a along x and b in the xy plane', () => {
    const wurtzite = formats.parseCIF(read('examples/cif/ZnS_wurtzite.cif'));
    const [a, b, c] = wurtzite.lattice;
    assert.deepEqual(a, [3.8227, 0, 0]);
    assert.equal(b[2], 0);
    assert.ok(Math.abs(length(b) - 3.8227) < 1e-9);
    assert.ok(Math.abs(angle(a, b) - 120) < 1e-9);
    assert.ok(Math.abs(length(c) - 6.2607) < 1e-9);
    assert.deepEqual(c.slice(0, 2), [0, 0]);

    const vanthoffite = formats.parseCIF(read('examples/cif/vanthoffite_monoclinic.cif'));
    const [va, vb, vc] = vanthoffite.lattice;
    assert.ok(Math.abs(angle(va, vc) - 113.5) < 1e-9);
    assert.ok(Math.abs(angle(va, vb) - 90) < 1e-9);
    assert.ok(Math.abs(angle(vb, vc) - 90) < 1e-9);
    assert.ok(vc[2] > 0, 'the cell is right-handed');

    // Uncertainties such as 8.641(1) are read as the value alone.
    const gibbsite = formats.parseCIF(read('tests/fixtures/cif/gibbsite_cod1011081.cif'));
    assert.ok(Math.abs(length(gibbsite.lattice[0]) - 8.641) < 1e-9);
    assert.ok(Math.abs(angle(gibbsite.lattice[0], gibbsite.lattice[2]) - 85.43) < 1e-9);
});

test('192 operations on the diamond site give the eight silicon positions once each', () => {
    const silicon = formats.parseCIF(read('tests/fixtures/cif/Si_cod9008566.cif'));
    assert.deepEqual(sortedFractional(silicon), [
        [0, 0, 0], [0, 0.5, 0.5], [0.25, 0.25, 0.25], [0.25, 0.75, 0.75],
        [0.5, 0, 0.5], [0.5, 0.5, 0], [0.75, 0.25, 0.75], [0.75, 0.75, 0.25]
    ]);
    const salt = formats.parseCIF(read('tests/fixtures/cif/NaCl_cod1000041.cif'));
    const sodium = salt.atoms.filter(atom => atom.element === 'Na');
    const chlorine = salt.atoms.filter(atom => atom.element === 'Cl');
    const nearest = Math.min(...sodium.flatMap(na => chlorine.map(cl => Math.hypot(na.position.x - cl.position.x, na.position.y - cl.position.y, na.position.z - cl.position.z))));
    assert.ok(Math.abs(nearest - 2.81) < 1e-9, `Na–Cl ${nearest}`);
});

test('elements come from the type symbol first, then the label, ignoring charges and case', () => {
    const polymer = formats.parseCIF(read('tests/fixtures/cif/polyisobutene_cod2300119.cif'));
    assert.deepEqual(polymer.elements, ['C', 'H']);
    assert.ok(polymer.atoms.some(atom => atom.siteLabel === 'c10' && atom.element === 'C'));
    const quartz = formats.parseCIF(read('examples/cif/SiO2_quartz.cif'));
    assert.deepEqual(quartz.elements, ['O', 'Si'], 'O-2 and Si+4 lose their charges');

    const cif = (sites, columns = '_atom_site_label\n_atom_site_fract_x\n_atom_site_fract_y\n_atom_site_fract_z') => [
        'data_test', '_cell_length_a 10', '_cell_length_b 10', '_cell_length_c 10',
        '_cell_angle_alpha 90', '_cell_angle_beta 90', '_cell_angle_gamma 90',
        '_symmetry_space_group_name_H-M "P 1"', 'loop_', columns, sites, ''
    ].join('\n');
    const labelled = formats.parseCIF(cif('OW1 0 0 0\nCa1 0.5 0 0\nD1 0 0.5 0\nNA2 0 0 0.5\nCL 0.5 0.5 0'));
    assert.deepEqual(labelled.elements, ['O', 'Ca', 'H', 'Na', 'Cl']);
    assert.throws(() => formats.parseCIF(cif('Xx1 0 0 0')), /cannot tell the element of site Xx1/);
});

test('symmetry operations accept spaces, quotes, decimals, products and reversed order', () => {
    const cif = ops => [
        'data_ops', '_cell_length_a 4', '_cell_length_b 4', '_cell_length_c 4',
        '_cell_angle_alpha 90', '_cell_angle_beta 90', '_cell_angle_gamma 90',
        'loop_', '_space_group_symop_operation_xyz', ops,
        'loop_', '_atom_site_label', '_atom_site_fract_x', '_atom_site_fract_y', '_atom_site_fract_z', 'Cu 0.1 0.2 0.3', ''
    ].join('\n');
    const spaced = formats.parseCIF(cif("' +x ,  +y ,  +z '\n'1/2-x, -y, z+1/2'"));
    assert.deepEqual(sortedFractional(spaced), [[0.1, 0.2, 0.3], [0.4, 0.8, 0.8]]);
    const decimal = formats.parseCIF(cif('x,y,z\n"0.5+x, y, 0.5-z"'));
    assert.deepEqual(sortedFractional(decimal), [[0.1, 0.2, 0.3], [0.6, 0.2, 0.2]]);
    const product = formats.parseCIF(cif('x,y,z\n-y,x-y,z\ny-x,-x,z'));
    assert.equal(product.atoms.length, 3);
    assert.deepEqual(sortedFractional(product), [[0.1, 0.2, 0.3], [0.1, 0.9, 0.3], [0.8, 0.9, 0.3]]);
    assert.throws(() => formats.parseCIF(cif('x/2,y,z')), /cannot read symmetry operation "x\/2,y,z"/);
    assert.throws(() => formats.parseCIF(cif('x,y')), /does not have three components/);
    assert.throws(() => formats.parseCIF(cif('x,x,z')), /not a proper or improper rotation/);
});

test('files without an operations loop are read only when the group is P1 or unstated', () => {
    const header = (group = null) => [
        'data_p1', '_cell_length_a 5', '_cell_length_b 6', '_cell_length_c 7',
        '_cell_angle_alpha 90', '_cell_angle_beta 90', '_cell_angle_gamma 90',
        ...(group ? [group] : []),
        'loop_', '_atom_site_label', '_atom_site_fract_x', '_atom_site_fract_y', '_atom_site_fract_z', 'Fe1 0 0 0', 'Fe2 0.5 0.5 0.5', ''
    ].join('\n');
    const explicit = formats.parseCIF(header("_symmetry_space_group_name_H-M 'P 1'"));
    assert.equal(explicit.atoms.length, 2);
    assert.deepEqual(explicit.cifInfo.notices, []);
    const numbered = formats.parseCIF(header('_space_group_IT_number 1'));
    assert.equal(numbered.atoms.length, 2);
    const unstated = formats.parseCIF(header());
    assert.equal(unstated.atoms.length, 2);
    assert.match(unstated.cifInfo.notices[0], /No space group or symmetry operations/);
    assert.throws(() => formats.parseCIF(header("_symmetry_space_group_name_H-M 'F m -3 m'")), /space group F m -3 m is named but no symmetry operations are listed/);
    assert.throws(() => formats.parseCIF(header('_space_group_IT_number 225')), /space group No\. 225/);
});

test('CIF2 dotted tags, text fields, comments and save frames are tolerated', () => {
    const cif = [
        '#\\#CIF_2.0', 'data_modern # trailing comment',
        '_publ_section_title', ';', 'A title that mentions loop_ and _cell_length_a 99', '; and continues here',
        'save_frame', '_junk.item 1', 'save_',
        '_cell.length_a 3.0(1)', '_cell.length_b 3.0', '_cell.length_c 3.0',
        '_cell.angle_alpha 90', '_cell.angle_beta 90', '_cell.angle_gamma 90',
        'loop_', '_space_group_symop.id', '_space_group_symop.operation_xyz', '1 x,y,z', "2 '-x,-y,-z'",
        'loop_', '_atom_site.label', '_atom_site.type_symbol', '_atom_site.fract_x', '_atom_site.fract_y', '_atom_site.fract_z', '_atom_site.occupancy',
        "O1 'O2-' 0.25 0 0 1.0", 'Mg1 Mg 0 0 0 1.0 # a comment after the row', ''
    ].join('\n');
    const structure = formats.parseCIF(cif);
    assert.deepEqual(composition(structure), { O: 2, Mg: 1 });
    assert.deepEqual(structure.lattice[0], [3, 0, 0]);
    assert.deepEqual(structure.cifInfo.notices, []);
});

test('missing coordinates, partial occupancy and extra data blocks are reported, not fatal', () => {
    const block = (name, rows) => [
        `data_${name}`, '_cell_length_a 4', '_cell_length_b 4', '_cell_length_c 4',
        '_cell_angle_alpha 90', '_cell_angle_beta 90', '_cell_angle_gamma 90', "_symmetry_space_group_name_H-M 'P 1'",
        'loop_', '_atom_site_label', '_atom_site_fract_x', '_atom_site_fract_y', '_atom_site_fract_z', '_atom_site_occupancy', rows
    ].join('\n');
    const content = `data_global\n_journal_name_full 'Nowhere'\n${block('first', 'Na1 0 0 0 1\nK1 0 0 0 0.5\nCl1 ? ? ? 1')}\n${block('second', 'Ar1 0 0 0 1')}\n`;
    const structure = formats.parseCIF(content);
    assert.deepEqual(composition(structure), { Na: 1, K: 1 });
    assert.equal(structure.comment, 'CIF first');
    assert.deepEqual(structure.cifInfo.notices, [
        'The file has 2 data blocks with atoms; only the first (first) is shown.',
        '1 atom site has no coordinates and is left out.',
        '1 site is partially occupied or disordered; every position is shown.'
    ]);
    assert.throws(() => formats.parseCIF(block('empty', 'X1 ? ? ? 1')), /every atom site is missing coordinates/);
});

test('positions on the cell boundary and float noise collapse to one atom each', () => {
    const cif = (x, ops) => [
        'data_edge', '_cell_length_a 4', '_cell_length_b 4', '_cell_length_c 4',
        '_cell_angle_alpha 90', '_cell_angle_beta 90', '_cell_angle_gamma 90',
        'loop_', '_symmetry_equiv_pos_as_xyz', ops,
        'loop_', '_atom_site_label', '_atom_site_fract_x', '_atom_site_fract_y', '_atom_site_fract_z', `C1 ${x} 0 0`, ''
    ].join('\n');
    const inversion = formats.parseCIF(cif('0', 'x,y,z\n-x,-y,-z'));
    assert.equal(inversion.atoms.length, 1);
    const noisy = formats.parseCIF(cif('0.99999999', 'x,y,z\n1-x,y,z'));
    assert.equal(noisy.atoms.length, 1);
    assert.deepEqual(noisy.atoms[0].fractional, [0, 0, 0]);
    const distinct = formats.parseCIF(cif('0.3333', 'x,y,z\n-x,-y,-z'));
    assert.equal(distinct.atoms.length, 2);
    const nearlySame = formats.parseCIF(cif('0.5002', 'x,y,z\n-x,-y,-z'));
    assert.equal(nearlySame.atoms.length, 1, '0.5002 and 0.4998 are one special position');
});

test('Cartesian-only sites are placed through the lattice', () => {
    const cif = [
        'data_cartn', '_cell_length_a 4', '_cell_length_b 4', '_cell_length_c 8',
        '_cell_angle_alpha 90', '_cell_angle_beta 90', '_cell_angle_gamma 90', "_symmetry_space_group_name_H-M 'P 1'",
        'loop_', '_atom_site_label', '_atom_site_Cartn_x', '_atom_site_Cartn_y', '_atom_site_Cartn_z', 'He 1 2 6', ''
    ].join('\n');
    const structure = formats.parseCIF(cif);
    assert.deepEqual(structure.atoms[0].fractional, [0.25, 0.5, 0.75]);
    assert.deepEqual([structure.atoms[0].position.x, structure.atoms[0].position.y, structure.atoms[0].position.z], [1, 2, 6]);
});

test('malformed CIF files are rejected with the reason', () => {
    const base = [
        'data_bad', '_cell_length_a 4', '_cell_length_b 4', '_cell_length_c 4',
        '_cell_angle_alpha 90', '_cell_angle_beta 90', '_cell_angle_gamma 90', "_symmetry_space_group_name_H-M 'P 1'",
        'loop_', '_atom_site_label', '_atom_site_fract_x', '_atom_site_fract_y', '_atom_site_fract_z', 'C1 0 0 0', ''
    ].join('\n');
    assert.throws(() => formats.parseCIF(base.replace('C1 0 0 0', 'C1 0 0')), /4 columns but 3 values/);
    assert.throws(() => formats.parseCIF(base.replace('_cell_length_a 4\n', '')), /cell length a .* is missing/);
    assert.throws(() => formats.parseCIF(base.replace('_cell_length_a 4', '_cell_length_a abc')), /is not a number/);
    assert.throws(() => formats.parseCIF(base.replace('_cell_angle_gamma 90', '_cell_angle_gamma 0')), /between 0° and 180°/);
    assert.throws(() => formats.parseCIF(base.replace('_cell_angle_gamma 90', '_cell_angle_gamma 179.999').replace('_cell_angle_alpha 90', '_cell_angle_alpha 0.001')), /three-dimensional cell/);
    assert.throws(() => formats.parseCIF(base.replace("'P 1'", "'P 1")), /unterminated quoted string on line 8/);
    assert.throws(() => formats.parseCIF(base.replace('C1 0 0 0', 'C1 0 0 1e400')), /not finite numbers/);
    assert.throws(() => formats.parseCIF('data_empty\n_cell_length_a 4\n'), /no atom sites found/);
    assert.throws(() => formats.parseCIF('just some words\n'), /no atom sites found/);
});

test('CIF detection by content leaves POSCAR and XYZ files alone', () => {
    assert.equal(formats.isCIFFormat(read('examples/cif/TiO2_rutile.cif')), true);
    assert.equal(formats.isCIFFormat('data_x\nloop_\n_atom_site_fract_x\n'), true);
    assert.equal(formats.isCIFFormat('_cell_length_a 4\n'), true);
    assert.equal(formats.isCIFFormat(read('examples/poscar/Si_diamond.poscar')), false);
    assert.equal(formats.isCIFFormat('1\ndata_x comment line\nH 0 0 0\n'), false);
    assert.equal(formats.isCIFFormat(read('examples/xyz/Si_diamond_extended.xyz')), false);
});

test('a CIF structure exports as POSCAR and reopens with the same atoms', () => {
    const quartz = formats.parseCIF(read('examples/cif/SiO2_quartz.cif'));
    assert.equal(documentModel.capabilities(quartz).constraints, true, 'CIF cells take selective-dynamics flags like POSCAR');
    const poscar = formats.generatePOSCAR(quartz);
    assert.match(poscar, /^Si O2\n1\.0\n/);
    const reopened = formats.parsePOSCAR(poscar);
    assert.deepEqual(reopened.elements, quartz.elements);
    assert.deepEqual(reopened.counts, quartz.counts);
    reopened.atoms.forEach((atom, index) => {
        assert.ok(Math.abs(atom.position.x - quartz.atoms[index].position.x) < 1e-8);
        assert.ok(Math.abs(atom.position.z - quartz.atoms[index].position.z) < 1e-8);
    });
});
