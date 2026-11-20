// Checklist rendering: the trophy rows, the detail panel, and the progress bar.
// Spoiler-safe mode hides the name, description and guide of un-earned story
// trophies until they are earned.

// A story trophy is hidden from a spoiler-safe reader until it is earned.
export function isSpoilerHidden(trophy, settings, earned) {
  return settings.spoiler && trophy.kind === 'story' && !earned.has(trophy.name);
}

// Filter the list by kind, grade, search text and the hide-earned toggle.
export function filterTrophies(trophies, settings, earned) {
  const query = settings.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (settings.kind === 'missable' && !t.missable) return false;
    if (settings.kind !== 'all' && settings.kind !== 'missable' && t.kind !== settings.kind) return false;
    if (settings.grade !== 'all' && t.grade !== settings.grade) return false;
    if (settings.hideEarned && earned.has(t.name)) return false;
    if (query) {
      const haystack = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function gradeTag(trophy) {
  const tag = document.createElement('span');
  tag.className = 'tag grade-' + trophy.grade;
  tag.textContent = trophy.grade;
  return tag;
}

function trophyTags(trophy) {
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  tags.append(gradeTag(trophy));
  if (trophy.missable) {
    const tag = document.createElement('span');
    tag.className = 'tag missable';
    tag.textContent = 'Possibly missable';
    tags.append(tag);
  }
  if (trophy.hidden) {
    const tag = document.createElement('span');
    tag.className = 'tag hidden-trophy';
    tag.textContent = 'Hidden on PlayStation';
    tags.append(tag);
  }
  if (trophy.count != null) {
    const tag = document.createElement('span');
    tag.className = 'tag count';
    tag.textContent = 'Tracks to ' + trophy.count.toLocaleString('en-US');
    tags.append(tag);
  }
  return tags;
}

// Render the checklist rows into the list element.
export function renderChecklist(listEl, trophies, settings, earned, selectedId, onSelect, onToggle) {
  const shown = filterTrophies(trophies, settings, earned);
  listEl.replaceChildren();
  for (const trophy of shown) {
    const row = document.createElement('li');
    row.className = 'trophy-row';
    if (trophy.id === selectedId) row.classList.add('is-selected');
    if (earned.has(trophy.name)) row.classList.add('is-earned');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', 'Earned: ' + trophy.name);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      onToggle(trophy);
    });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    if (isSpoilerHidden(trophy, settings, earned)) {
      name.textContent = 'Hidden story trophy';
      desc.textContent = 'Hidden until earned — turn the spoiler setting off, or earn it, to reveal it.';
    } else {
      name.textContent = trophy.name;
      desc.textContent = trophy.description;
    }
    body.append(name, desc, trophyTags(trophy));
    const stage = document.createElement('span');
    stage.className = 'tag';
    stage.textContent = 'Stage ' + trophy.stage;
    row.append(box, body, stage);
    row.addEventListener('click', (event) => {
      if (event.target === box) return;
      onSelect(trophy);
    });
    listEl.append(row);
  }
  return shown.length;
}

// Render the detail panel for one trophy: official text, guide, sources.
export function renderDetail(detailEl, trophy, settings, earned, onToggle) {
  detailEl.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Click a trophy to see its guide, its sources and when it can be missed.';
    detailEl.append(empty);
    return;
  }
  const hidden = isSpoilerHidden(trophy, settings, earned);
  const heading = document.createElement('h2');
  heading.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden
    ? 'Official name and description hidden until earned.'
    : 'Official: ' + trophy.description + ' — ' + trophy.grade + (trophy.hidden ? ' · hidden on PlayStation' : '');
  detailEl.append(heading, official, trophyTags(trophy));
  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = hidden
    ? 'Guide hidden until earned — this is a story trophy, and its guide names story moments.'
    : trophy.guide;
  detailEl.append(guideHeading, guide);
  if (!hidden) {
    const sourcesHeading = document.createElement('h3');
    sourcesHeading.textContent = 'Sources';
    const sources = document.createElement('ul');
    for (const [label, url] of trophy.sources) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = url;
      link.textContent = label;
      link.target = '_blank';
      link.rel = 'noopener';
      item.append(link);
      sources.append(item);
    }
    detailEl.append(sourcesHeading, sources);
    const metaHeading = document.createElement('h3');
    metaHeading.textContent = 'Details';
    const meta = document.createElement('p');
    const bits = ['Kind: ' + trophy.kind, 'Roadmap stage ' + trophy.stage];
    if (trophy.count != null) bits.push('PlayStation tracks a count to ' + trophy.count.toLocaleString('en-US'));
    bits.push(trophy.missable ? 'Flagged possibly missable — see the Missables tab.' : 'Not flagged missable.');
    meta.textContent = bits.join(' · ') + '.';
    detailEl.append(metaHeading, meta);
  }
  const earnedLine = document.createElement('p');
  earnedLine.className = 'earned-line';
  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.addEventListener('change', () => onToggle(trophy));
  label.append(box, document.createTextNode(earned.has(trophy.name) ? ' Earned' : ' Mark as earned'));
  earnedLine.append(label);
  detailEl.append(earnedLine);
}

// Update the header progress card.
export function renderProgress(trophies, earned) {
  document.getElementById('earnedCount').textContent = String(earned.size);
  document.getElementById('totalCount').textContent = String(trophies.length);
  const pct = Math.round((earned.size / trophies.length) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '% to the Platinum';
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  const parts = grades.map((grade) => {
    const total = trophies.filter((t) => t.grade === grade).length;
    const done = trophies.filter((t) => t.grade === grade && earned.has(t.name)).length;
    return grade + ' ' + done + '/' + total;
  });
  document.getElementById('progressGrades').textContent = parts.join(' · ');
}
