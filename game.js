'use strict';

const startingBudget = 300;
const items = [
  ['topper', 'Bed', 'bed', 'Mattress topper on the floor', 45, 'A topper is sold as an extra layer for a mattress. The essay begins with a family who bought toppers by mistake, tried them on the floor, and found them comfortable enough to keep using for four years. What would you want to try before buying a whole bed?'],
  ['foldable', 'Bed', 'bed', 'Foldable futon', 60, 'In Japan, futon bedding is traditionally laid out on woven mats called tatami. Folding it away allows the room to serve other purposes during the day. Western-style beds also became more common after World War II, as ideas about furnishing the home changed.'],
  ['thick', 'Bed', 'bed', 'Thick floor mattress', 140, 'This setup keeps the cushioning of a mattress and saves the cost of a frame. Think about how much space it takes up, how easy it is to get up from, and how you would keep the underside dry.'],
  ['frame', 'Bed', 'bed', 'Frame and mattress', 230, 'A frame raises the mattress off the floor and can leave room for airflow or storage. In early modern England, bedsteads and layered bedding could also signal wealth. Which benefits would make the extra cost worthwhile to you?'],
  ['childhood', 'Bedding', 'sheets', 'Reused childhood sheets', 5, 'The faded stars are part of the story. Reusing a set you already have can keep a familiar pattern in your room and leave money for something else.'],
  ['fancy', 'Bedding', 'sheets', 'Fancy striped sheets', 45, 'A matching bed can feel good to come home to. Researchers studying IKEA catalogs in China found that the catalogs associated furnishings with an ideal home and a better life. How much of the appeal is the pattern, and how much is the room you imagine around it?'],
  ['pillows', 'Bedding', 'pillows', 'Pillow set', 20, 'Stacking pillows gives you something to lean against while reading in bed. Extra pillows also take up space when you want to stretch out.'],
  ['throw', 'Bedding', 'throw', 'Knit throw blanket', 25, 'A throw adds a layer you can pull over your feet or fold away. Draping it across the end of the bed also makes its color visible from across the room.'],
  ['bear', 'Decor', 'toy', 'Stuffed bear', 15, 'One small object can make a room feel like yours. A stuffed animal you already own could bring the same personal touch without a new purchase.'],
  ['poster', 'Decor', 'poster', 'Moonrise poster', 10, 'In a shared room, a poster can show what you like and make your corner recognizable. Think about what you would hang for yourself and what you would choose with roommates or guests in mind.'],
  ['lights', 'Decor', 'lighting', 'String lights', 30, 'Small lights spread points of warm color along the wall. Try Night mode to see how much more noticeable their glow becomes when the room is dark.']
].map(([id, category, slot, name, price, fact]) => ({ id, category, slot, name, price, fact }));

const factSources = {
  foldable: ['Read Kikusawa on changing home life in Japan', 'https://doi.org/10.1177/1077727X7900700602'],
  frame: ['Read Fletcher on beds in early modern England', 'https://doi.org/10.1093/hisres/htae001'],
  fancy: ['Read Chong and Chow on IKEA catalogs', 'https://doi.org/10.1017/9781108769471.027']
};

const bedReflections = {
  topper: 'Your topper left more money for other purchases. Would it feel like a proper bed in your own room? What would make that answer change?',
  foldable: 'Your futon can be put away during the day. What else would you use the room for if your bed could fold away?',
  thick: 'You spent money on a thick mattress and kept it at floor level. Would you make the same trade-off in a different room?',
  frame: 'Your frame and mattress left $70 for everything else. What did having a raised bed give you, and what did you give up to buy it?'
};

const get = (id) => document.getElementById(id);
const categoryButtons = [...document.querySelectorAll('[data-category]')];
const storageKey = 'bed-space-round-v1';
const newRound = () => ({ owned: [], night: false });

function loadRound() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!Array.isArray(saved?.owned)) return newRound();
    const owned = saved.owned.map((id) => items.find((item) => item.id === id));
    const valid = owned.every(Boolean)
      && (!owned.length || owned[0].slot === 'bed')
      && new Set(owned.map((item) => item.slot)).size === owned.length
      && owned.reduce((spent, item) => spent + item.price, 0) <= startingBudget;
    return valid ? { owned, night: saved.night === true } : newRound();
  } catch {
    return newRound();
  }
}

let round = loadRound();
let category = round.owned.length ? 'Bedding' : 'Bed';
let selection = null;

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      owned: round.owned.map((item) => item.id),
      night: round.night
    }));
  } catch {
    // The current round remains playable when storage is unavailable.
  }
}

function balance() {
  return startingBudget - round.owned.reduce((spent, item) => spent + item.price, 0);
}

function canPlace(item) {
  return (item.slot === 'bed' || round.owned.length > 0)
    && !round.owned.some((owned) => owned.slot === item.slot);
}

function finished() {
  return balance() === 0 || !items.some((item) => canPlace(item) && item.price <= balance());
}

function paint(preview = true) {
  const visible = [...round.owned];
  if (preview && selection) visible.push(selection);
  drawRoom(get('room'), Object.fromEntries(visible.map((item) => [item.slot, item.id])), round.night);
  get('room').setAttribute('aria-label', visible.length
    ? 'Room with ' + visible.map((item) => item.name).join(', ')
    : 'Empty room with a window and rug');
}

function render() {
  const left = balance();
  const done = finished();
  get('balance').textContent = '$' + left;
  get('night').setAttribute('aria-pressed', round.night);
  get('save').disabled = !round.owned.length;
  get('shop-title').textContent = done ? 'Your room is finished' : 'Room shop';
  get('guide').textContent = done
    ? (left && items.some(canPlace) ? 'Your remaining budget cannot cover another item.' : 'Your round is complete.')
    : (round.owned.length ? 'Preview an item, then buy it to place it.' : 'Choose a sleeping setup to get started.');
  get('shop-content').hidden = done;
  get('summary').hidden = !done;
  if (done) {
    get('round-totals').textContent = 'You spent $' + (startingBudget - left) + ' and have $' + left + ' left.';
    get('bed-reflection').textContent = bedReflections[round.owned[0].id];
  }
  for (const button of categoryButtons) {
    button.disabled = button.dataset.category !== 'Bed' && !round.owned.length;
    button.setAttribute('aria-pressed', button.dataset.category === category);
  }
  get('catalog').replaceChildren();
  for (const item of items.filter((entry) => entry.category === category)) {
    const occupied = !canPlace(item);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'item';
    button.dataset.item = item.id;
    button.disabled = occupied;
    button.setAttribute('aria-pressed', item === selection);
    const name = document.createElement('span');
    name.textContent = item.name;
    const cost = document.createElement('span');
    cost.textContent = '$' + item.price;
    button.append(name, cost);
    const note = occupied
      ? (round.owned.includes(item) ? 'Placed' : 'Slot already filled')
      : (item.price > left ? 'Over budget' : '');
    if (note) {
      const status = document.createElement('small');
      status.textContent = note;
      button.append(status);
    }
    button.addEventListener('click', () => {
      selection = item;
      render();
      get('catalog').querySelector('[aria-pressed="true"]').focus();
    });
    get('catalog').append(button);
  }
  get('preview').textContent = selection
    ? (selection.price <= left ? '$' + (left - selection.price) + ' left after this purchase.' : 'You need $' + (selection.price - left) + ' more for this item.')
    : 'Select an item to preview it in the room.';
  get('buy').disabled = done || !selection || selection.price > left;
  paint();
}

categoryButtons.forEach((button) => button.addEventListener('click', () => {
  category = button.dataset.category;
  selection = null;
  render();
}));

get('buy').addEventListener('click', () => {
  if (!selection || finished() || !canPlace(selection) || selection.price > balance()) return;
  const item = selection;
  round.owned.push(item);
  selection = null;
  if (item.slot === 'bed') category = 'Bedding';
  persist();
  // Leave the shop in place until the purchase fact has been read.
  get('balance').textContent = '$' + balance();
  paint();
  get('fact-title').textContent = item.name;
  get('fact-text').textContent = item.fact;
  const sourceLink = get('fact-source');
  const source = factSources[item.id];
  sourceLink.hidden = !source;
  if (source) [sourceLink.textContent, sourceLink.href] = source;
  get('facts').showModal();
});

get('facts').addEventListener('close', () => {
  render();
  if (finished()) {
    get('shop-title').tabIndex = -1;
    get('shop-title').focus();
  } else {
    categoryButtons.find((button) => button.dataset.category === category).focus();
  }
});

get('night').addEventListener('click', () => {
  round.night = !round.night;
  persist();
  render();
});

get('save').addEventListener('click', () => {
  paint(false);
  const download = document.createElement('a');
  download.download = 'my-bed-space.png';
  download.href = get('room').toDataURL('image/png');
  download.click();
  paint();
});

get('restart').addEventListener('click', () => {
  get('reset').returnValue = '';
  get('reset').showModal();
});

get('reset').addEventListener('close', () => {
  if (get('reset').returnValue !== 'confirm') return;
  round = newRound();
  selection = null;
  category = 'Bed';
  persist();
  render();
});

render();
