// Roadmap stages: the order to earn the trophies in, built from the official
// descriptions — which story chapters and missions, which collectibles and
// counts, in what order. Each trophy's "stage" in trophies.json points here.
export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Story first — Chapters 1 to 5',
    text: 'Play the campaign straight through. The 12 story trophies (the opening mission, Chapters 1–4, the final mission and the six named missions) plus the five vague story moments all unlock in campaign order. Nothing here can be missed, so just enjoy the story — it also takes about 50–60 hours on its own.',
  },
  {
    stage: 2,
    title: 'Side characters and strangers',
    text: 'Finish the final missions for Andy, Kenton, Billy, Randy and Tyrone, hunt the unique animal for Bret, and complete 8 stranger mission strands. Only some stranger strands count — Kirk, Kyle, Yago and Pilot Pete do; the side characters with their own trophies do not.',
  },
  {
    stage: 3,
    title: 'Map and collectibles',
    text: 'Reveal all 52 areas of Leonida, meditate at all 18 spots (do the first one in Chapter 1 — it is the one possibly missable trophy), use WAiNK at 100 locations, complete 3 card sets, discover 100 vehicles, buy all 8 garages and register 10 vehicles in the Scooter Bros app.',
  },
  {
    stage: 4,
    title: 'Races, stunts and shooting',
    text: 'Win 20 different races, win a Top Fun drone race at each of the 14 locations, land 250 stunts, gold all 42 Shooting Range challenges, try all 9 activity types, beat Cal at fishing, finish an arcade game and clear 50 challenges.',
  },
  {
    stage: 5,
    title: 'Robberies and combat',
    text: 'Rob 5 of the 8 bank vaults, an armored truck and a jewelry store undetected, rob 3 shops in a row with your partner, lose a 4-star wanted level together, hit one illegal operation per gang, take down 5 enemies in one Combat Focus, and pull off the airport and showroom one-offs.',
  },
  {
    stage: 6,
    title: 'Money, one-offs and the Platinum',
    text: 'Launder $250,000 in Marked Bills, spend $100,000 across shops, enjoy the Ocean Beach cocktail, bowl at Kolt & Associates, then push the 100% completion checklist to the end. A Long Road pops — and Vice Got a Price!, the Platinum, follows immediately.',
  },
];

// Render the roadmap view: one card per stage, with its trophies and progress.
export function renderRoadmap(container, trophies, earned, selectTrophy) {
  container.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => earned.has(t.name)).length;
    const card = document.createElement('article');
    card.className = 'stage-card';
    const heading = document.createElement('h2');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = 'Stage ' + stage.stage;
    heading.append(num, document.createTextNode(stage.title));
    const text = document.createElement('p');
    text.textContent = stage.text;
    const progress = document.createElement('p');
    progress.className = 'stage-progress';
    progress.textContent = done + ' of ' + members.length + ' earned in this stage';
    const list = document.createElement('ul');
    list.className = 'stage-trophies';
    for (const trophy of members) {
      const item = document.createElement('li');
      const mark = document.createElement('span');
      mark.className = earned.has(trophy.name) ? 'done' : 'todo';
      mark.textContent = earned.has(trophy.name) ? '✓' : '○';
      const label = document.createElement('span');
      label.textContent = trophy.name + ' — ' + trophy.grade;
      item.append(mark, label);
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => selectTrophy(trophy));
      list.append(item);
    }
    card.append(heading, text, progress, list);
    container.append(card);
  }
}

// Render the missables view: the flagged trophy, in full, with its guide.
export function renderMissables(container, trophies, earned, selectTrophy) {
  container.replaceChildren();
  const flagged = trophies.filter((t) => t.missable);
  if (flagged.length === 0) {
    const note = document.createElement('p');
    note.textContent = 'No trophy in this guide is flagged missable.';
    container.append(note);
    return;
  }
  for (const trophy of flagged) {
    const card = document.createElement('article');
    card.className = 'missable-card';
    const heading = document.createElement('h2');
    heading.textContent = '⚠ ' + trophy.name + ' — possibly missable';
    const official = document.createElement('p');
    official.className = 'official';
    official.textContent = 'Official: ' + trophy.description + ' (' + trophy.grade + ')';
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
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
    const earnedLine = document.createElement('p');
    earnedLine.textContent = earned.has(trophy.name) ? '✓ Earned' : 'Not earned yet — do it early, in Chapter 1.';
    card.append(heading, official, guide, sourcesHeading, sources, earnedLine);
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => selectTrophy(trophy));
    container.append(card);
  }
}
