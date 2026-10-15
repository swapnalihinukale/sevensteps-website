export type MotionEvent = 'play' | 'pause' | 'inspection' | 'hidden' | 'offscreen' | 'layout' | 'modal' | 'still' | 'end' | 'reset';
export interface MotionState { playing: boolean; position: number }
export function transitionMotion(state: MotionState, event: MotionEvent, allowed = true): MotionState {
  if (event === 'play') return { ...state, playing: allowed };
  if (event === 'reset') return { playing: false, position: 0 };
  return { ...state, playing: false };
}
export function boundedStep(position: number, delta: number, limit: number): number {
  return Math.max(0, Math.min(Math.max(0, limit), position + delta));
}
