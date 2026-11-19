'use strict';

function drawRoom(canvas, room, night) {
  const ctx = canvas.getContext('2d');
  function shape(color, points) {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.fill();
  }
  function block(color, x, y, width, height, radius = 0) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  }
  function oval(color, x, y, width, height) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  function line(color, width, points) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.stroke();
  }
  function star(color, x, y, size) {
    line(color, 2, [[x - size, y], [x + size, y]]);
    line(color, 2, [[x, y - size], [x, y + size]]);
  }

  block(night ? '#3e354d' : '#e9c3ad', 0, 0, 900, 650);
  shape(night ? '#29283e' : '#ce9d88', [[660, 0], [900, 0], [900, 510], [660, 402]]);
  shape(night ? '#453545' : '#b98163', [[0, 402], [660, 402], [900, 510], [900, 650], [0, 650]]);
  line(night ? '#635063' : '#f2cdb7', 9, [[0, 402], [660, 402], [900, 510]]);
  for (let y = 454; y < 650; y += 46) {
    line(night ? '#514052' : '#a77157', 2, [[0, y], [660, y], [900, y + 65]]);
  }

  block(night ? '#765c70' : '#91624f', 73, 88, 211, 219, 105);
  block(night ? '#253450' : '#bcd8d4', 84, 99, 189, 199, 95);
  oval(night ? '#f8dfad' : '#fff0bf', 167, 157, 25, 25);
  if (night) {
    star('#e1d1e4', 228, 149, 5);
    star('#e1d1e4', 121, 184, 4);
    star('#e1d1e4', 213, 201, 6);
  }
  shape(night ? '#465570' : '#87aaa1', [[84, 233], [132, 208], [177, 240], [230, 193], [273, 231], [273, 280], [84, 280]]);
  block(night ? '#765c70' : '#91624f', 174, 102, 9, 193);
  block(night ? '#765c70' : '#91624f', 84, 220, 189, 8);
  block(night ? '#765c70' : '#91624f', 65, 280, 227, 17, 5);

  oval(night ? '#574753' : '#d6a18b', 457, 533, 320, 88);
  oval(night ? '#685260' : '#e3b4a0', 457, 533, 293, 73);
  oval(night ? '#624b54' : '#bd8f7e', 457, 533, 270, 60);

  if (room.poster) {
    block(night ? '#8e6f85' : '#825345', 444, 111, 140, 171, 4);
    block('#f4d4bb', 451, 118, 126, 157);
    block('#926783', 461, 129, 106, 135);
    oval('#ffe3b7', 519, 176, 30, 30);
    shape('#554565', [[461, 233], [491, 197], [527, 227], [567, 209], [567, 264], [461, 264]]);
    star('#ffe3b7', 478, 156, 5);
  }

  if (room.bed) {
    const raised = room.bed === 'frame';
    const height = raised ? 72 : room.bed === 'thick' ? 34 : 0;
    const mattressDepth = { topper: 12, foldable: 17, thick: 56, frame: 33 }[room.bed];
    const top = (points) => points.map(([x, y]) => [x, y - height]);
    oval('#33212a44', 474, 521, 255, 44);
    if (raised) {
      block(night ? '#624956' : '#88523a', 231, 245, 311, 137, 18);
      for (let x = 245; x <= 520; x += 25) {
        block(night ? '#775867' : '#a36748', x, 255, 8, 102, 4);
      }
      shape('#744432', [[267, 435], [621, 435], [740, 485], [740, 508], [270, 508]]);
      for (const x of [292, 674, 723]) block('#714433', x, 477, 15, 52, 3);
    }
    shape(night ? '#8b788d' : '#c9a297', top([[212, 471], [649, 480], [743, 478], [743, 478 + mattressDepth], [649, 499 + mattressDepth], [212, 496 + mattressDepth]]));
    const mattressColor = room.bed === 'topper' ? '#d7c69b' : '#f4ddd0';
    shape(night ? '#b4a0aa' : mattressColor, top([[282, 371], [567, 371], [743, 478], [649, 499], [212, 496]]));
    if (room.sheets) {
      const fancy = room.sheets === 'fancy';
      shape(fancy ? '#a45b66' : '#777da7', top([[270, 391], [600, 391], [743, 478], [649, 499], [212, 496]]));
      shape(fancy ? '#813e55' : '#575c89', top([[212, 496], [649, 499], [743, 478], [743, 488], [649, 511], [212, 508]]));
      if (fancy) {
        for (let y = 402; y < 495; y += 12) {
          line('#efb6ac', 3, top([[270 - (y - 391) * .49, y], [600 + (y - 391) * (y > 477 ? .36 : 1.45), y]]));
        }
      } else {
        for (let y = 405; y <= 477; y += 24) {
          for (let x = 277 + (y % 5) * 6; x <= 585; x += 46) {
            star('#e3d7ef', x, y - height, 5);
          }
        }
      }
    }
    if (room.pillows) {
      block('#a6757b', 280, 374 - height, 126, 53, 22);
      block('#f1c9bf', 277, 368 - height, 126, 50, 21);
      block('#765974', 421, 373 - height, 123, 53, 22);
      block('#bf99af', 419, 366 - height, 123, 49, 21);
    }
    if (room.throw) {
      shape('#a86646', top([[243, 447], [687, 447], [743, 478], [649, 499], [212, 496]]));
      for (let y = 454; y < 493; y += 7) {
        line('#d59a73', 2, top([[242 - (y - 447) * .6, y], [686 + (y - 447) * .7, y]]));
      }
      for (let x = 224; x < 650; x += 12) {
        line('#ad6d4e', 3, top([[x, 496], [x - 1, 509]]));
      }
    }
    if (room.toy) {
      const y = 403 - height;
      oval('#924f40', 561, y, 27, 23);
      oval('#b7714d', 561, y - 24, 24, 21);
      oval('#b7714d', 542, y - 39, 10, 10);
      oval('#b7714d', 580, y - 39, 10, 10);
      oval('#e8ad83', 561, y - 19, 11, 8);
      oval('#392723', 552, y - 28, 2, 3);
      oval('#392723', 570, y - 28, 2, 3);
      oval('#392723', 561, y - 22, 3, 2);
    }
  }

  if (night) block('#241c4c40', 0, 0, 900, 650);
  if (room.lighting) {
    const bulbs = [[332, 82], [376, 94], [420, 98], [464, 92], [508, 79], [552, 57], [596, 80], [640, 94], [684, 101], [729, 100], [774, 90]];
    line(night ? '#a77c75' : '#815646', 3, bulbs);
    for (const [x, y] of bulbs) {
      if (night) {
        const glow = ctx.createRadialGradient(x, y + 5, 0, x, y + 5, 35);
        glow.addColorStop(0, '#ffce7688');
        glow.addColorStop(1, '#ffac5400');
        oval(glow, x, y + 5, 35, 35);
      }
      oval(night ? '#ffe4a4' : '#fbdb9e', x, y + 5, 5, 8);
    }
  }
}
