import "./styles.css";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const app = document.querySelector("#app");

app.innerHTML = `
  <main class="shell">
    <section class="hud">
      <div>
        <p class="kicker">Human-Ever-After</p>
        <h1>Yark: Cerebrium Run</h1>
      </div>
      <div class="readout">
        <span>Move <b>WASD</b></span>
        <span>Mine <b>Space</b></span>
        <span>Dock <b>R</b></span>
      </div>
    </section>
    <section class="game">
      <div class="canvas-wrap"></div>
      <aside class="panel">
        <h2>Abyssus Contract</h2>
        <p>Pilot Yark's pressure sub through Enceladus's living caverns. Mine Cerebrium, avoid Deep sentries and thermal vents, then return to the dock to bank cargo and upgrade.</p>
        <div class="bars"></div>
        <div class="modules"></div>
        <div class="message"></div>
        <button class="primary" type="button" id="restart">Restart Run</button>
      </aside>
    </section>
  </main>
`;

document.querySelector(".canvas-wrap").append(canvas);

const keys = new Set();
const world = { width: 2200, height: 1400 };
const dock = { x: 190, y: 170, r: 86 };
const player = {
  x: dock.x,
  y: dock.y,
  vx: 0,
  vy: 0,
  angle: 0,
  hull: 100,
  oxygen: 100,
  cargo: 0,
  credits: 0,
  xp: 0,
  level: 1,
  mining: 1,
  engine: 1,
  plating: 1,
  scanner: 1,
  invuln: 0
};

let camera = { x: 0, y: 0 };
let message = "Dive, mine, return. The vein pays well when it does not eat the crew.";
let gameOver = false;
let last = performance.now();

const nodes = [];
const vents = [];
const sentries = [];
const particles = [];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function seedWorld() {
  nodes.length = 0;
  vents.length = 0;
  sentries.length = 0;
  particles.length = 0;

  for (let i = 0; i < 42; i += 1) {
    nodes.push({
      x: rand(360, world.width - 120),
      y: rand(260, world.height - 120),
      r: rand(16, 30),
      ore: rand(18, 42),
      pulse: rand(0, 10)
    });
  }

  for (let i = 0; i < 18; i += 1) {
    vents.push({
      x: rand(430, world.width - 160),
      y: rand(250, world.height - 120),
      r: rand(38, 68),
      phase: rand(0, 6)
    });
  }

  for (let i = 0; i < 9; i += 1) {
    sentries.push({
      x: rand(600, world.width - 180),
      y: rand(330, world.height - 160),
      baseX: 0,
      baseY: 0,
      t: rand(0, 100),
      r: rand(90, 150)
    });
    sentries[i].baseX = sentries[i].x;
    sentries[i].baseY = sentries[i].y;
  }
}

function resize() {
  const wrap = document.querySelector(".canvas-wrap");
  const rect = wrap.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function maxCargo() {
  return 45 + player.level * 10;
}

function upgradeCost(level) {
  return 55 + level * 35;
}

function docked() {
  return distance(player, dock) < dock.r + 24;
}

function mine(dt) {
  if (!keys.has(" ") || gameOver) return;
  const power = 22 + player.mining * 11;
  for (const node of nodes) {
    if (node.ore <= 0 || distance(player, node) > node.r + 54) continue;
    const taken = Math.min(node.ore, power * dt, maxCargo() - player.cargo);
    if (taken <= 0) {
      message = "Cargo bay full. Return to Abyssus to refine.";
      return;
    }
    node.ore -= taken;
    player.cargo += taken;
    player.xp += taken * 0.12;
    for (let i = 0; i < 2; i += 1) {
      particles.push({ x: node.x, y: node.y, vx: rand(-30, 30), vy: rand(-30, 30), life: 0.7 });
    }
    message = "Cerebrium fragments sing through the drill head.";
    break;
  }
}

function bankCargo() {
  if (!docked()) {
    message = "Docking beacon out of range.";
    return;
  }
  if (player.cargo > 0) {
    const value = Math.floor(player.cargo * 4);
    player.credits += value;
    player.xp += player.cargo * 0.25;
    player.cargo = 0;
    player.oxygen = 100;
    player.hull = Math.min(100, player.hull + 18 + player.plating * 4);
    message = `Cargo refined for ${value} credits. Hull patched, oxygen cycled.`;
  } else {
    player.oxygen = 100;
    player.hull = Math.min(100, player.hull + 8);
    message = "Abyssus cycles your tanks and checks the hull seams.";
  }
}

function buy(module) {
  if (!docked()) {
    message = "Upgrades require docking at Abyssus.";
    return;
  }
  const cost = upgradeCost(player[module]);
  if (player.credits < cost) {
    message = `Need ${cost} credits for that module.`;
    return;
  }
  player.credits -= cost;
  player[module] += 1;
  message = `${module[0].toUpperCase()}${module.slice(1)} module upgraded.`;
}

function update(dt) {
  if (gameOver) return;
  const thrust = 220 + player.engine * 36;
  const drag = 0.91;
  let ax = 0;
  let ay = 0;
  if (keys.has("w") || keys.has("arrowup")) ay -= thrust;
  if (keys.has("s") || keys.has("arrowdown")) ay += thrust;
  if (keys.has("a") || keys.has("arrowleft")) ax -= thrust;
  if (keys.has("d") || keys.has("arrowright")) ax += thrust;

  player.vx = (player.vx + ax * dt) * drag;
  player.vy = (player.vy + ay * dt) * drag;
  player.x = Math.max(40, Math.min(world.width - 40, player.x + player.vx * dt));
  player.y = Math.max(40, Math.min(world.height - 40, player.y + player.vy * dt));
  if (Math.hypot(player.vx, player.vy) > 8) player.angle = Math.atan2(player.vy, player.vx);

  player.oxygen -= dt * (docked() ? -14 : 2.2);
  player.oxygen = Math.min(100, player.oxygen);
  if (player.oxygen <= 0) player.hull -= dt * 15;
  player.invuln = Math.max(0, player.invuln - dt);

  mine(dt);

  for (const vent of vents) {
    vent.phase += dt;
    const active = Math.sin(vent.phase * 1.8) > 0.35;
    if (active && distance(player, vent) < vent.r && player.invuln <= 0) {
      player.hull -= Math.max(1, 9 - player.plating) * dt;
      message = "Thermal vent boiling against hull plating.";
    }
  }

  for (const sentry of sentries) {
    sentry.t += dt;
    sentry.x = sentry.baseX + Math.cos(sentry.t * 0.7) * sentry.r;
    sentry.y = sentry.baseY + Math.sin(sentry.t * 0.54) * sentry.r * 0.56;
    if (distance(player, sentry) < 42 && player.invuln <= 0) {
      player.hull -= Math.max(4, 16 - player.plating * 2);
      player.invuln = 1;
      player.vx += (player.x - sentry.x) * 1.2;
      player.vy += (player.y - sentry.y) * 1.2;
      message = "A Deep sentry rammed the sub. The cult does not like independent miners.";
    }
  }

  for (const particle of particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
  }
  while (particles.length && particles[0].life <= 0) particles.shift();

  const need = player.level * 34;
  if (player.xp >= need) {
    player.xp -= need;
    player.level += 1;
    player.credits += 40;
    message = `Yark reached level ${player.level}. Abyssus grants a hazard bonus.`;
  }

  if (player.hull <= 0) {
    gameOver = true;
    message = "Run lost. The submarine goes quiet in the living dark.";
  }

  camera.x = Math.max(0, Math.min(world.width - canvas.clientWidth, player.x - canvas.clientWidth / 2));
  camera.y = Math.max(0, Math.min(world.height - canvas.clientHeight, player.y - canvas.clientHeight / 2));
}

function drawGrid() {
  ctx.fillStyle = "#07151a";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  const gradient = ctx.createRadialGradient(dock.x, dock.y, 40, world.width * 0.62, world.height * 0.68, world.width);
  gradient.addColorStop(0, "#153642");
  gradient.addColorStop(0.5, "#09212a");
  gradient.addColorStop(1, "#210f1f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.strokeStyle = "rgba(146, 225, 202, 0.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x < world.width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + Math.sin(x) * 30, world.height);
    ctx.stroke();
  }
  for (let y = 0; y < world.height; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y + Math.cos(y) * 30);
    ctx.stroke();
  }
}

function draw() {
  drawGrid();

  ctx.beginPath();
  ctx.arc(dock.x, dock.y, dock.r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(232, 196, 106, 0.18)";
  ctx.fill();
  ctx.strokeStyle = "#e8c46a";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#f6efd8";
  ctx.font = "700 18px system-ui";
  ctx.fillText("ABYSSUS DOCK", dock.x - 70, dock.y + 6);

  for (const vent of vents) {
    const active = Math.sin(vent.phase * 1.8) > 0.35;
    ctx.beginPath();
    ctx.arc(vent.x, vent.y, vent.r, 0, Math.PI * 2);
    ctx.fillStyle = active ? "rgba(218, 96, 87, 0.24)" : "rgba(218, 96, 87, 0.08)";
    ctx.fill();
    ctx.strokeStyle = active ? "rgba(255, 167, 127, 0.54)" : "rgba(255, 167, 127, 0.22)";
    ctx.stroke();
  }

  for (const node of nodes) {
    if (node.ore <= 0) continue;
    node.pulse += 0.03;
    const glow = 0.28 + Math.sin(node.pulse) * 0.12;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r + Math.sin(node.pulse) * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(118, 227, 191, ${glow})`;
    ctx.fill();
    ctx.strokeStyle = "#9df2d3";
    ctx.stroke();
  }

  for (const sentry of sentries) {
    ctx.save();
    ctx.translate(sentry.x, sentry.y);
    ctx.rotate(sentry.t);
    ctx.fillStyle = "#b65f83";
    ctx.strokeStyle = "#ffd5e4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-14, 16);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-14, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = "#caf9df";
    ctx.fillRect(particle.x, particle.y, 3, 3);
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);
  ctx.fillStyle = "#f4d46f";
  ctx.strokeStyle = "#fff7cf";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.quadraticCurveTo(6, -18, -30, -12);
  ctx.lineTo(-38, 0);
  ctx.lineTo(-30, 12);
  ctx.quadraticCurveTo(6, 18, 28, 0);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#17323a";
  ctx.beginPath();
  ctx.arc(8, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function updateHud() {
  document.querySelector(".bars").innerHTML = `
    ${bar("Hull", player.hull)}
    ${bar("Oxygen", player.oxygen)}
    ${bar("Cargo", player.cargo, maxCargo())}
    ${bar("XP", player.xp, player.level * 34)}
    <div class="line"><span>Level</span><b>${player.level}</b></div>
    <div class="line"><span>Credits</span><b>${player.credits}</b></div>
  `;

  document.querySelector(".modules").innerHTML = ["mining", "engine", "plating", "scanner"]
    .map((module) => {
      const cost = upgradeCost(player[module]);
      return `<button class="module" data-module="${module}">
        <span>${module}</span><b>Lv ${player[module]}</b><small>${cost} cr</small>
      </button>`;
    })
    .join("");

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => buy(button.dataset.module));
  });

  document.querySelector(".message").textContent = message;
}

function bar(label, value, max = 100) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return `<div class="bar"><span>${label}</span><div><i style="width:${pct}%"></i></div><b>${Math.floor(value)}</b></div>`;
}

function reset() {
  Object.assign(player, {
    x: dock.x,
    y: dock.y,
    vx: 0,
    vy: 0,
    angle: 0,
    hull: 100,
    oxygen: 100,
    cargo: 0,
    credits: 0,
    xp: 0,
    level: 1,
    mining: 1,
    engine: 1,
    plating: 1,
    scanner: 1,
    invuln: 0
  });
  message = "Dive, mine, return. The vein pays well when it does not eat the crew.";
  gameOver = false;
  seedWorld();
}

function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  updateHud();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (event.key.toLowerCase() === "r") bankCargo();
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("resize", resize);
document.querySelector("#restart").addEventListener("click", reset);

resize();
seedWorld();
requestAnimationFrame(loop);
