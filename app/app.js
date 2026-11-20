// Leonida Trophy Guide — bootstrap: load the trophy data, wire the tracker.
// The only run-time fetch is the relative data/trophies.json; nothing else
// leaves the browser, so the guide works with the network off.
import {
  loadEarned, saveEarned, loadSettings, saveSettings,
  buildExportPayload, parseImportPayload, downloadExport,
} from './state.js';
import { renderChecklist, renderDetail, renderProgress } from './render.js';
import { renderRoadmap, renderMissables } from './roadmap.js';
import { applyShotScene, markShotReady } from './shots.js';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const earned = loadEarned();
const settings = loadSettings();

let selectedId = null;

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const listMeta = document.getElementById('listMeta');
const roadmapEl = document.getElementById('roadmapStages');
const missableEl = document.getElementById('missableList');

function selectedTrophy() {
  return trophies.find((t) => t.id === selectedId) ?? null;
}

function rerender() {
  renderProgress(trophies, earned);
  const shown = renderChecklist(
    listEl, trophies, settings, earned, selectedId,
    (trophy) => { selectedId = trophy.id; rerender(); },
    (trophy) => toggleEarned(trophy),
  );
  listMeta.textContent = 'Showing ' + shown + ' of ' + trophies.length + ' trophies'
    + (settings.spoiler ? ' · spoiler-safe on: un-earned story trophies are hidden' : '');
  renderDetail(detailEl, selectedTrophy(), settings, earned, (trophy) => toggleEarned(trophy));
  renderRoadmap(roadmapEl, trophies, earned, (trophy) => {
    selectedId = trophy.id;
    switchView('checklist');
    rerender();
  });
  renderMissables(missableEl, trophies, earned, (trophy) => {
    selectedId = trophy.id;
    switchView('checklist');
    rerender();
  });
}

function toggleEarned(trophy) {
  if (earned.has(trophy.name)) earned.delete(trophy.name);
  else earned.add(trophy.name);
  saveEarned(earned);
  rerender();
}

function switchView(view) {
  settings.view = view;
  saveSettings(settings);
  for (const tab of document.querySelectorAll('.view-tab')) {
    tab.classList.toggle('is-active', tab.dataset.view === view);
  }
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('is-active', section.id === 'view-' + view);
  }
}

function bindControls() {
  const search = document.getElementById('search');
  const kindFilter = document.getElementById('kindFilter');
  const gradeFilter = document.getElementById('gradeFilter');
  const hideEarned = document.getElementById('hideEarned');
  const spoilerToggle = document.getElementById('spoilerToggle');
  search.value = settings.search;
  kindFilter.value = settings.kind;
  gradeFilter.value = settings.grade;
  hideEarned.checked = settings.hideEarned;
  spoilerToggle.checked = settings.spoiler;
  search.addEventListener('input', () => { settings.search = search.value; saveSettings(settings); rerender(); });
  kindFilter.addEventListener('change', () => { settings.kind = kindFilter.value; saveSettings(settings); rerender(); });
  gradeFilter.addEventListener('change', () => { settings.grade = gradeFilter.value; saveSettings(settings); rerender(); });
  hideEarned.addEventListener('change', () => { settings.hideEarned = hideEarned.checked; saveSettings(settings); rerender(); });
  spoilerToggle.addEventListener('change', () => { settings.spoiler = spoilerToggle.checked; saveSettings(settings); rerender(); });
  for (const tab of document.querySelectorAll('.view-tab')) {
    tab.addEventListener('click', () => { switchView(tab.dataset.view); });
  }
  document.getElementById('exportBtn').addEventListener('click', () => {
    downloadExport(buildExportPayload(earned));
  });
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = parseImportPayload(await file.text(), trophies.map((t) => t.name));
    if (result.error) {
      listMeta.textContent = 'Import failed: ' + result.error;
      return;
    }
    earned.clear();
    for (const name of result.earned) earned.add(name);
    saveEarned(earned);
    rerender();
  });
}

// A ?shot= scene seeds progress and picks the view first, so bindControls
// syncs the checkboxes and selects to the scene's settings.
const shotSelected = applyShotScene(trophies, settings, earned);
if (shotSelected != null) selectedId = shotSelected;
bindControls();
switchView(settings.view);
rerender();
// Let the screenshot script know the page is fully rendered.
requestAnimationFrame(() => setTimeout(markShotReady, 300));
