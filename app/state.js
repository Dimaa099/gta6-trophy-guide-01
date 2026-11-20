// Progress state: earned trophies and settings, saved in localStorage.
// Export writes a file; import reads one back. Nothing leaves the browser.
export const EARNED_KEY = 'gta6-trophy-guide-01:earned';
export const SETTINGS_KEY = 'gta6-trophy-guide-01:settings';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

export function loadSettings() {
  const defaults = { spoiler: false, hideEarned: false, kind: 'all', grade: 'all', search: '', view: 'checklist' };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Build the export payload: game, date and the earned trophy names.
export function buildExportPayload(earned) {
  return {
    game: 'Grand Theft Auto VI',
    guide: 'Leonida Trophy Guide',
    exportedAt: new Date().toISOString(),
    earned: [...earned],
  };
}

// Parse an imported file. Returns { earned: Set } or { error: string }.
export function parseImportPayload(text, knownNames) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'That file is not valid JSON.' };
  }
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) {
    return { error: 'That file has no earned-trophy list in it.' };
  }
  const known = new Set(knownNames);
  const earned = new Set();
  for (const name of names) {
    if (typeof name === 'string' && known.has(name)) earned.add(name);
  }
  return { earned };
}

// Trigger a download of the export file in the browser.
export function downloadExport(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'gta6-trophy-progress.json';
  anchor.click();
  URL.revokeObjectURL(url);
}
