'use strict';

const startingBudget = 200;
const comfortTarget = 100;
const items = [
  ['topper', 'Bed', 'bed', 'Mattress topper on the floor', 45, 70, 
    'A topper is sold as an extra layer for a mattress. It can be placed directly on the floor to save money and space. In a shared room, a topper can be moved to make room for a friend or guest. It is also just as comfortable as a mattress! Still, elevated bed frames can be necessary in humid environments by reducing direct contact with the floor. By raising the mattress off the floor, bed frames help prevent mold growth and moisture buildup in mattresses. I also personally experienced a rat running across my mattress topper on the floor once. Although such incidents may be rare, concerns like these can still be important factors when deciding whether to purchase a bed frame. However, cleaning and drying mattress toppers and futons are very easy due to their thin and foldable structuree.'],
  ['foldable', 'Bed', 'bed', 'Foldable futon', 60, 70, 'In Japan, futon bedding is traditionally laid out on woven mats called tatami. Folding it away allows the room to serve other purposes during the day. Western-style beds also became more common after World War II. This shift in preference may have been influenced by Western political and cultural power. The geopolitical power imbalance may have made Western products seem more fashionable and prestigious, turning them into symbols of social status. Just as owning a luxurious bed in medieval Europe symbolized wealth, some Japanese people may have adopted Western-style furniture to project higher social status.'],
  ['thick', 'Bed', 'bed', 'Thick floor mattress', 140, 75, 'This setup keeps the cushioning of a mattress and saves the cost of a frame. Think about how much space it takes up, how easy it is to get up from, and how you would keep the underside dry. '],
  ['frame', 'Bed', 'bed', 'Frame and mattress', 230, 80, 'A frame raises the mattress off the floor and can leave room for airflow or storage. In early modern England, bedsteads and layered bedding could also signal wealth. Which benefits would make the extra cost worthwhile to you?'],
  ['childhood', 'Bedding', 'sheets', 'Reused childhood sheets', 5, 10, 'The faded stars are part of the story. Reusing a set you already have can keep a familiar pattern in your room and leave money for something else.'],
  ['fancy', 'Bedding', 'sheets', 'Fancy striped sheets', 45, 14, 'A matching bed can feel good to come home to. Researchers studying IKEA catalogs in China found that the catalogs associated furnishings with an ideal home and a better life. How much of the appeal is the pattern, and how much is the room you imagine around it?'],
  ['pillows', 'Bedding', 'pillows', 'Pillow set', 20, 25, 'Stacking pillows gives you something to lean against while reading in bed. Extra pillows also take up space when you want to stretch out.'],
  ['throw', 'Bedding', 'throw', 'Knit throw blanket', 25, 26, 'A throw adds a layer you can pull over your feet or fold away. Draping it across the end of the bed also makes its color visible from across the room.'],
  ['bear', 'Decor', 'toy', 'Stuffed bear', 15, 8, 'One small object can make a room feel like yours. A stuffed animal you already own could bring the same personal touch without a new purchase.'],
  ['poster', 'Decor', 'poster', 'Moonrise poster', 10, 4, 'In a shared room, a poster can show what you like and make your corner recognizable. Think about what you would hang for yourself and what you would choose with roommates or guests in mind.'],
  ['lights', 'Decor', 'lighting', 'String lights', 30, 7, 'Small lights spread points of warm color along the wall. Try Night mode to see how much more noticeable their glow becomes when the room is dark.']
].map(([id, category, slot, name, price, comfort, fact]) => ({ id, category, slot, name, price, comfort, fact }));

const factSources = {
  foldable: ['Read Kikusawa on changing home life in Japan', 'https://doi.org/10.1177/1077727X7900700602'],
  frame: ['Read Fletcher on beds in early modern England', 'https://doi.org/10.1093/hisres/htae001'],
  fancy: ['Read Chong and Chow on IKEA catalogs', 'https://doi.org/10.1017/9781108769471.027']
};

const bedReflections = {
  topper: 'Your topper left more money for other purchases. Would it feel like a proper bed in your own room? What would make that answer change?',
  foldable: 'Your futon can be put away during the day. What else would you use the room for if your bed could fold away?',
  thick: 'You spent money on a thick mattress and kept it at floor level. Would you make the same trade-off in a different room?',
  frame: 'Your frame and mattress took up a large share of the budget. What did having a raised bed give you, and what did you give up to buy it?'
};

const get = (id) => document.getElementById(id);
const categoryButtons = [...document.querySelectorAll('[data-category]')];
const storageKey = 'bed-space-round-v1';
const newRound = () => ({ owned: [], night: false, submitted: false });

function loadRound() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!Array.isArray(saved?.owned)) return newRound();
    const owned = saved.owned.map((id) => items.find((item) => item.id === id));
    const valid = owned.every(Boolean)
      && (!owned.length || owned[0].slot === 'bed')
      && new Set(owned.map((item) => item.slot)).size === owned.length
      && owned.slice(0, -1).reduce((spent, item) => spent + item.price, 0) < startingBudget;
    return valid ? { owned, night: saved.night === true, submitted: owned.length > 0 && saved.submitted === true } : newRound();
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
      night: round.night,
      submitted: round.submitted
    }));
  } catch {
    // The current round remains playable when storage is unavailable.
  }
}

function balance() {
  return startingBudget - round.owned.reduce((spent, item) => spent + item.price, 0);
}

function comfort() {
  return round.owned.reduce((total, item) => total + item.comfort, 0);
}

function updateStats() {
  get('balance').textContent = '$' + balance();
  get('comfort').textContent = comfort();
}

function canPlace(item) {
  return (item.slot === 'bed' || round.owned.length > 0)
    && !round.owned.some((owned) => owned.slot === item.slot);
}

function lost() {
  return balance() < 0;
}

function finished() {
  return round.submitted || lost() || balance() === 0 || !items.some((item) => canPlace(item) && item.price <= balance());
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
  updateStats();
  get('finish').disabled = !round.owned.length || lost() || round.submitted;
  get('check-result').hidden = !round.submitted;
  get('night').setAttribute('aria-pressed', round.night);

  if (lost()) {
    get('shop-title').textContent = 'you lose the game';
    get('guide').textContent = 'you lose the game';
    get('shop-content').hidden = true;
    get('summary').hidden = false;
    get('round-totals').textContent = 'You went $' + Math.abs(left) + ' over budget.';
    get('bed-reflection').textContent = '';
    get('save').disabled = true;
    get('buy').disabled = true;
    for (const button of categoryButtons) button.disabled = true;
    paint();
    return;
  }

  get('save').disabled = !round.owned.length;
  get('shop-title').textContent = done ? 'Your room is finished' : 'Room shop';
  get('guide').textContent = done
    ? (round.submitted ? 'Your round is complete.' : 'Shopping is complete. Check your design to see your result.')
    : (round.owned.length ? 'Preview an item, then buy it to place it.' : 'Choose a sleeping setup to get started.');
  get('shop-content').hidden = done;
  get('summary').hidden = !done;
  if (done) {
    get('round-totals').textContent = 'You spent $' + (startingBudget - left) + ' and have $' + left + ' left. Your comfort score is ' + comfort() + '.';
    get('check-result').textContent = balance() > 0 && comfort() > comfortTarget
      ? 'You win the game!'
      : 'To win, finish with money left and more than ' + comfortTarget + ' comfort points.';
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
    const points = document.createElement('small');
    points.textContent = '+' + item.comfort + ' comfort';
    button.append(name, cost, points);
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
    ? (selection.price <= left ? '$' + (left - selection.price) + ' left after this purchase.' : 'This purchase will leave $' + Math.abs(left - selection.price) + ' of debt.')
    : 'Select an item to preview it in the room.';
  get('buy').disabled = done || !selection;
  paint();
}

categoryButtons.forEach((button) => button.addEventListener('click', () => {
  category = button.dataset.category;
  selection = null;
  render();
}));

get('buy').addEventListener('click', () => {
  if (!selection || finished() || !canPlace(selection)) return;
  const item = selection;
  round.owned.push(item);
  selection = null;
  if (item.slot === 'bed') category = 'Bedding';
  persist();
  if (lost()) {
    render();
    return;
  }
  // Leave the shop in place until the purchase fact has been read.
  updateStats();
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
    (get('finish').disabled ? get('shop-title') : get('finish')).focus();
  } else {
    categoryButtons.find((button) => button.dataset.category === category).focus();
  }
});

get('finish').addEventListener('click', () => {
  if (!round.owned.length || lost() || round.submitted) return;
  round.submitted = true;
  selection = null;
  persist();
  render();
  get('check-result').focus();
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
