import "./styles.css";

const stages = [
  {
    id: "freetown",
    era: "Freetown, Ceres",
    title: "Noise Before Descent",
    text:
      "Murmur billboards rake the alley walls. The Silent Shrine is half mural, half static, and the crooked Dark System sticker in your glove case keeps catching the temple light.",
    scene: "Freetown grit, pilgrim rumor, and the first pull toward Enceladus.",
    choices: [
      {
        label: "Mute the implant scar",
        effect: { silence: 2, signal: 1 },
        result:
          "The anxiety-field thins to a wire hum. In the quiet, Dark's old phrase stops sounding like doctrine and starts sounding like a location."
      },
      {
        label: "Question the shrine keepers",
        effect: { signal: 2, stress: 1 },
        result:
          "They call Dark the First Submerger. One pilgrim draws a listening ear beside her sinking silhouette, then refuses to say why."
      },
      {
        label: "Pocket the analog notebook",
        effect: { witness: 2, silence: 1 },
        result:
          "Paper is absurd in a sub-ocean, which is why you trust it. Anything too fragile to survive becomes honest."
      }
    ]
  },
  {
    id: "descent",
    era: "Enceladus Sub-Ocean",
    title: "The Hull Fails",
    text:
      "Red instrument light cuts your helmet into angles. The submersible drops through black water, tether taut, while bioluminescent motes move like patient stars.",
    scene: "Pressure groan, severed tether, first organic pulse of raw Cerebrium.",
    choices: [
      {
        label: "Fight toward the surface tether",
        effect: { stress: 2, witness: 1 },
        result:
          "Training screams sample and retreat. Your hands obey for three seconds, then the vein answers with a pulse under the ridge."
      },
      {
        label: "Release and sink deeper",
        effect: { silence: 2, stress: 1 },
        result:
          "Water takes the decision from your muscles. Dark's reverse echo resolves into one sentence: Stop swimming up."
      },
      {
        label: "Follow the vein glow",
        effect: { signal: 2, silence: 1 },
        result:
          "The ore is not ore. It breathes behind a crystalline membrane, warm in a place that should be dead cold."
      }
    ]
  },
  {
    id: "contact",
    era: "The Living Vein",
    title: "Dark's Dream",
    text:
      "Your gauntlet meets the membrane. The cramped frame of survival opens into a colossal silence: Branch A ice, Freetown rain, severance, death, and a crystal silhouette shaped like a woman who refused forever.",
    scene: "Vision-span: Cerebrium as choir, Dark as idea, Jark as carrier or offering.",
    choices: [
      {
        label: "Keep your glove sealed",
        effect: { witness: 2, stress: -1 },
        result:
          "The vision stays survivable. Dark's life passes through you as evidence, not possession."
      },
      {
        label: "Press bare skin to crystal",
        effect: { silence: 2, signal: 1, stress: 1 },
        result:
          "Pain and recognition overlap. Deep guardians turn their hoods toward you, not stopping you, not saving you."
      },
      {
        label: "Ask why she chose you",
        effect: { witness: 2, signal: 1 },
        result:
          "Dark's Dream bends close: Because you hate noise. The answer is gentle enough to wound."
      }
    ]
  },
  {
    id: "threshold",
    era: "The Spiral",
    title: "What Survives",
    text:
      "The vein-core rotates around you. Dark is not a ghost and not a god. She is a structure made from a choice: symbiosis, not strip-mining.",
    scene: "The last decision before the story chooses its ending.",
    choices: [
      {
        label: "Hold one human thread",
        effect: { witness: 2, stress: -1 },
        result:
          "You refuse immortality, but not return. A small thread of self remains anchored to breath, blood, and testimony."
      },
      {
        label: "Enter the crystal chest",
        effect: { silence: 3, signal: 1 },
        result:
          "Your outline starts to lattice. The word I becomes unstable, then generous, then plural."
      },
      {
        label: "Carry the silence home",
        effect: { witness: 3, signal: 1 },
        result:
          "The ruined notebook presses against your ribs. One page stays dry as if the universe has developed a taste for impossible props."
      }
    ]
  }
];

const endings = {
  canonical: {
    title: "Canonical Descent",
    source: "V1",
    line: "A smile in wreckage; ambiguous survival.",
    text:
      "The frame collapses back to grain. The submersible lies broken on the ridge, veins fading around it. Your eyes close, and a small smile survives the pressure. Rescue may come. Absorption may already have happened. The crystal gives one reverse-echo syllable, then nothing.",
    tone: "Ambiguous witness"
  },
  submerge: {
    title: "Submerge",
    source: "V2",
    line: "Jark merges into the vein; no return.",
    text:
      "The empty exosuit rests beside the ridge. Inside the helmet, the Dark System sticker has dissolved into new crystal growth. Freetown still burns. The vein still breathes. You have become infrastructure.",
    tone: "Horror-sacrament"
  },
  bearer: {
    title: "Bearer",
    source: "V3",
    line: "Jark returns to Freetown; living apostle.",
    text:
      "Months later, your voice competes with the Murmur in a Freetown alley. It does not win. It persists. Youths gather under the shrine mural as you read from the page that should have drowned: Enceladus is not a mine. It is a choir.",
    tone: "Survival testimony"
  }
};

const state = {
  index: 0,
  silence: 0,
  signal: 0,
  stress: 0,
  witness: 0,
  log: []
};

const app = document.querySelector("#app");

function endingForState() {
  if (state.silence >= state.witness + 2 && state.silence >= 6) return "submerge";
  if (state.witness >= 6 && state.signal >= 3) return "bearer";
  return "canonical";
}

function clampStat(value) {
  return Math.max(0, Math.min(9, value));
}

function applyChoice(choice) {
  for (const [key, value] of Object.entries(choice.effect)) {
    state[key] = clampStat((state[key] ?? 0) + value);
  }
  state.log.push({
    stage: stages[state.index].title,
    choice: choice.label,
    result: choice.result
  });
  state.index += 1;
  render();
}

function resetGame() {
  state.index = 0;
  state.silence = 0;
  state.signal = 0;
  state.stress = 0;
  state.witness = 0;
  state.log = [];
  render();
}

function statBar(label, value) {
  return `
    <div class="stat">
      <span>${label}</span>
      <div class="track" aria-hidden="true"><i style="width: ${(value / 9) * 100}%"></i></div>
      <strong>${value}</strong>
    </div>
  `;
}

function renderCanvasBackdrop() {
  const canvas = document.querySelector("#vein-canvas");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#071016");
  gradient.addColorStop(0.45, "#123335");
  gradient.addColorStop(1, "#4b1f2f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const pulse = 0.45 + Math.sin(Date.now() / 900) * 0.18;
  for (let i = 0; i < 88; i += 1) {
    const x = (Math.sin(i * 19.17) * 0.5 + 0.5) * width;
    const y = (Math.cos(i * 31.73) * 0.5 + 0.5) * height;
    const r = 1 + ((i * 7) % 11) * 0.35;
    ctx.beginPath();
    ctx.fillStyle = `rgba(139, 232, 203, ${0.08 + pulse * 0.22})`;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i += 1) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(218, 181, 92, ${0.18 + i * 0.025})`;
    const startY = height * (0.15 + i * 0.085);
    ctx.moveTo(-40, startY);
    ctx.bezierCurveTo(width * 0.28, startY - 80, width * 0.56, startY + 100, width + 40, startY - 20);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(width * 0.72, height * 0.5);
  ctx.rotate(-0.16);
  const body = ctx.createRadialGradient(0, 0, 10, 0, 0, Math.min(width, height) * 0.28);
  body.addColorStop(0, "rgba(240, 255, 231, 0.35)");
  body.addColorStop(0.5, "rgba(107, 214, 187, 0.17)");
  body.addColorStop(1, "rgba(107, 214, 187, 0)");
  ctx.fillStyle = body;
  ctx.fillRect(-180, -260, 360, 520);
  ctx.restore();
}

function render() {
  const current = stages[state.index];
  const isEnding = !current;
  const ending = isEnding ? endings[endingForState()] : null;
  const progress = isEnding ? 100 : (state.index / stages.length) * 100;

  app.innerHTML = `
    <main class="shell">
      <section class="game-surface">
        <canvas id="vein-canvas" aria-label="A living Cerebrium vein under Enceladus"></canvas>
        <div class="hud">
          <div>
            <p class="kicker">Human-Ever-After</p>
            <h1>Jark: The Silent Vein</h1>
          </div>
          <button class="icon-button" type="button" aria-label="Restart descent" title="Restart descent" data-reset>
            <span aria-hidden="true">↻</span>
          </button>
        </div>
        <div class="progress" aria-hidden="true"><i style="width: ${progress}%"></i></div>
        <div class="content-grid">
          <article class="scene-panel">
            ${
              isEnding
                ? `
                  <p class="kicker">${ending.source} Ending</p>
                  <h2>${ending.title}</h2>
                  <p class="lead">${ending.line}</p>
                  <p>${ending.text}</p>
                  <div class="ending-tone">${ending.tone}</div>
                  <button class="primary" type="button" data-reset>Begin again</button>
                `
                : `
                  <p class="kicker">${current.era}</p>
                  <h2>${current.title}</h2>
                  <p class="lead">${current.text}</p>
                  <p>${current.scene}</p>
                  <div class="choice-list">
                    ${current.choices
                      .map(
                        (choice, index) => `
                          <button class="choice" type="button" data-choice="${index}">
                            <span>${choice.label}</span>
                          </button>
                        `
                      )
                      .join("")}
                  </div>
                `
            }
          </article>
          <aside class="systems-panel">
            <div class="portrait">
              <div class="helmet"></div>
              <div>
                <p class="kicker">Pilgrim Profile</p>
                <h3>Jark</h3>
                <p>Freetown explorer, Murmur-resistant, drawn toward Dark's Dream beneath Enceladus.</p>
              </div>
            </div>
            <div class="stats">
              ${statBar("Silence", state.silence)}
              ${statBar("Signal", state.signal)}
              ${statBar("Stress", state.stress)}
              ${statBar("Witness", state.witness)}
            </div>
            <div class="log">
              <h3>Memory Trace</h3>
              ${
                state.log.length
                  ? state.log
                      .map(
                        (entry) => `
                          <div class="log-entry">
                            <strong>${entry.stage}</strong>
                            <span>${entry.choice}</span>
                            <p>${entry.result}</p>
                          </div>
                        `
                      )
                      .join("")
                  : `<p>The first trace has not entered the vein.</p>`
              }
            </div>
          </aside>
        </div>
      </section>
    </main>
  `;

  document.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => applyChoice(current.choices[Number(button.dataset.choice)]));
  });
  document.querySelectorAll("[data-reset]").forEach((button) => {
    button.addEventListener("click", resetGame);
  });
  renderCanvasBackdrop();
}

window.addEventListener("resize", renderCanvasBackdrop);
window.setInterval(() => {
  if (document.querySelector("#vein-canvas")) renderCanvasBackdrop();
}, 1200);

render();
