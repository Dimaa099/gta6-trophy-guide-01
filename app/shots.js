// Screenshot scenes: ?shot= sets up a deterministic view for the screenshots.
// cover — checklist with 13 of 55 earned and the Positive Mental Attitude guide open.
// roadmap — the roadmap view. missables — the missables view.
// spoiler — checklist with the spoiler setting on and story trophies hidden.
import { saveEarned, saveSettings } from './state.js';

const COVER_EARNED = [
  'Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money', 'Vice City, Baby!',
  'Top Of The World, Ma', 'Trust', 'Baited My Tackle', 'Stick Fiddler',
  'In The Beginning…', 'Let’s Go Bowling', 'Ten Pin', 'Treat Yo Self', 'On the Spot',
];

const SPOILER_EARNED = ['Baited My Tackle', 'Stick Fiddler', 'Treat Yo Self'];

// Apply a ?shot= scene. Returns the trophy id to select, or null.
export function applyShotScene(trophies, settings, earned) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  if (shot === 'cover') {
    earned.clear();
    for (const name of COVER_EARNED) earned.add(name);
    saveEarned(earned);
    settings.spoiler = false;
    settings.view = 'checklist';
    saveSettings(settings);
    const trophy = trophies.find((t) => t.name === 'Positive Mental Attitude');
    return trophy ? trophy.id : null;
  }
  if (shot === 'roadmap') {
    settings.view = 'roadmap';
    saveSettings(settings);
    return null;
  }
  if (shot === 'missables') {
    settings.view = 'missables';
    saveSettings(settings);
    return null;
  }
  if (shot === 'spoiler') {
    earned.clear();
    for (const name of SPOILER_EARNED) earned.add(name);
    saveEarned(earned);
    settings.spoiler = true;
    settings.view = 'checklist';
    saveSettings(settings);
    return null;
  }
  return null;
}

// Tell the screenshot script the page has finished rendering.
export function markShotReady() {
  window.__shotReady = true;
}
