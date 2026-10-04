import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const { gsap } = require('gsap');
const source = readFileSync(new URL('../src/scenes/ProjectsScene/archiveController.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
// The controller has one runtime import. Exercise real GSAP without a DOM/ScrollTrigger harness.
new Function('exports', 'require', compiled)(exports, (id) => {
  assert.equal(id, '../../lib/gsap');
  return { gsap };
});
const { ProjectArchiveController } = exports;
const categories = ['development', 'graphic', 'video', 'uiux'];
const records = categories.flatMap(category => Array.from({ length: 5 }, (_, i) => ({
  id: `${category}-${i}`, title: `${category} ${i}`, category, featured: true,
  images: [{ alt: 'first' }, { alt: 'second' }], tools: [], video: category === 'video' ? {} : undefined,
})));
function fixture(t, reduced = true) {
  const owner = gsap.context(() => {});
  const controller = new ProjectArchiveController(records, categories);
  controller.connect(() => {}, owner);
  controller.setReducedMotion(reduced);
  t.after(() => { controller.destroy(); owner.revert(); });
  controller.power.value = 1;
  controller.applyPower();
  return controller;
}

test('featured tour caps each category at three while keeping all twenty disks', t => {
  const c = fixture(t);
  assert.equal(c.projects.length, 20);
  assert.deepEqual(c.featured, [0, 1, 2, 5, 6, 7, 10, 11, 12, 15, 16, 17]);
});
test('manual disk survives scroll jitter and yields at a different featured stop', t => {
  const c = fixture(t);
  c.select(19);
  c.tour.value = .1; c.syncFromScroll();
  assert.equal(c.getSnapshot().active, 19);
  assert.equal(c.getSnapshot().manual, true);
  c.tour.value = 1; c.syncFromScroll();
  assert.equal(c.getSnapshot().active, 1);
  assert.equal(c.getSnapshot().manual, false);
});
test('changing records clears frame refresh and live reduced motion completes the latest load', t => {
  const c = fixture(t);
  c.setReducedMotion(false);
  c.setImage(1);
  c.select(7); c.select(14); c.select(4);
  c.setReducedMotion(true);
  assert.equal(c.getSnapshot().active, 4);
  assert.equal(c.getSnapshot().image, 0);
  assert.equal(c.getSnapshot().loading, false);
  assert.equal(c.getSnapshot().refreshing, false);
  assert.equal(c.glow.value, 1);
});
test('reverting the camera context cannot cancel archive boot', t => {
  const owner = gsap.context(() => {});
  const camera = gsap.context(() => {});
  const c = new ProjectArchiveController(records, categories);
  c.connect(() => {}, owner);
  t.after(() => { c.destroy(); owner.revert(); });
  camera.add(() => { c.power.value = 1; c.applyPower(); });
  camera.revert();
  c.setReducedMotion(true);
  assert.equal(c.getSnapshot().boot, 'ready');
  assert.equal(c.getSnapshot().enabled, true);
  c.power.value = 0; c.applyPower();
  c.power.value = 1; c.applyPower();
  assert.equal(c.getSnapshot().boot, 'ready');
});
test('an empty video slot cannot open an empty player', t => {
  const c = fixture(t);
  c.select(10); c.play();
  assert.equal(c.getSnapshot().playing, false);
});
