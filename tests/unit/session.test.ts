import { beforeEach, describe, expect, it } from 'vitest';

import { useSessionStore } from '@/store/session';

const reset = () =>
  useSessionStore.setState({ status: 'idle', device: 'Default', lastTranscript: null });

describe('session store', () => {
  beforeEach(reset);

  it('transitions to recording when start is called', () => {
    useSessionStore.getState().start();
    expect(useSessionStore.getState().status).toBe('recording');
  });

  it('hands off to transcribing when stop is called', () => {
    useSessionStore.getState().start();
    useSessionStore.getState().stop();
    expect(useSessionStore.getState().status).toBe('transcribing');
  });

  it('returns to idle when cancel is called', () => {
    useSessionStore.getState().start();
    useSessionStore.getState().cancel();
    expect(useSessionStore.getState().status).toBe('idle');
  });

  it('updates the active device when setDevice is called', () => {
    useSessionStore.getState().setDevice('MacBook Microphone');
    expect(useSessionStore.getState().device).toBe('MacBook Microphone');
  });

  it('sets status directly when setStatus is called', () => {
    useSessionStore.getState().setStatus('error');
    expect(useSessionStore.getState().status).toBe('error');
  });

  it('stores the last transcript when setLastTranscript is called', () => {
    useSessionStore.getState().setLastTranscript('hello world');
    expect(useSessionStore.getState().lastTranscript).toBe('hello world');
  });
});
