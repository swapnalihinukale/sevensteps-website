import test from 'node:test';
import assert from 'node:assert/strict';
import { transitionMotion, boundedStep } from '../src/lib/motion.ts';

test('explicit Play starts from paused; a new inspection pauses and latches', () => {
  const playing = transitionMotion({ playing: false, position: 42 }, 'play');
  assert.deepEqual(playing, { playing: true, position: 42 });
  assert.deepEqual(transitionMotion(playing, 'inspection'), { playing: false, position: 42 });
});
test('device still mode or hidden component cannot start', () => {
  assert.equal(transitionMotion({ playing: false, position: 5 }, 'play', false).playing, false);
});
test('lifecycle interruptions preserve position, while reset returns to the first frame', () => {
  const state = { playing: true, position: 83 };
  for (const event of ['hidden', 'offscreen', 'layout', 'modal', 'still', 'end'] as const) {
    assert.deepEqual(transitionMotion(state, event), { playing: false, position: 83 });
  }
  assert.deepEqual(transitionMotion(state, 'reset'), { playing: false, position: 0 });
});
test('a finite pass cannot run beyond either edge or a resized zero-length strip', () => {
  assert.equal(boundedStep(9, 5, 10), 10);
  assert.equal(boundedStep(1, -5, 10), 0);
  assert.equal(boundedStep(12, 1, 0), 0);
});
