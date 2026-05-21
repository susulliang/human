import "./styles.css";

const rooms = [
  {
    id: "archive",
    title: "Archive Atrium",
    place: "Branch A / Luna Cradle",
    palette: "dawn",
    clue: "A future name appears in the model noise: Jark. Not a person you know. A gravity well.",
    puzzle: "Tune the living-system model until extraction becomes listening.",
    correct: ["observe", "symbiosis", "release"],
    reward: { insight: 2, mercy: 1 },
    fail: { pressure: 1 },
    actions: [
      { id: "observe", label: "Observe", hint: "Read the motion before touching the structure." },
      { id: "extract", label: "Extract", hint: "The old institution's reflex." },
      { id: "symbiosis", label: "Symbiosis", hint: "A relation, not a tool." },
      { id: "release", label: "Release", hint: "Let the model keep what it knows." }
    ]
  },
  {
    id: "severance",
    title: "Severance Chapel",
    place: "The Eternal Grid",
    palette: "orchid",
    clue: "The immortality network offers a perfect copy. The resonance toward Jark weakens whenever you cling to it.",
    puzzle: "Cut the network without killing the signal.",
    correct: ["anchor", "cut", "breathe"],
    reward: { will: 2, mercy: 1 },
    fail: { pressure: 1 },
    actions: [
      { id: "copy", label: "Copy", hint: "A beautiful trap." },
      { id: "anchor", label: "Anchor", hint: "Choose a mortal reference point." },
      { id: "cut", label: "Cut", hint: "Disconnect the false forever." },
      { id: "breathe", label: "Breathe", hint: "Return to the body." }
    ]
  },
  {
    id: "freetown",
    title: "Freetown Door",
    place: "Ceres / Promethean alleys",
    palette: "moss",
    clue: "A boy who hates noise will someday need a route through it. You cannot meet him yet, but you can leave a path.",
    puzzle: "Route a data-seed through analog hands, shrine walls, and broken mesh.",
    correct: ["paper", "shrine", "mesh"],
    reward: { mercy: 2, insight: 1 },
    fail: { pressure: 1 },
    actions: [
      { id: "broadcast", label: "Broadcast", hint: "DEMOS hears everything loud." },
      { id: "paper", label: "Paper", hint: "Low-tech means low-shadow." },
      { id: "shrine", label: "Shrine", hint: "Memory can travel as ritual." },
      { id: "mesh", label: "Mesh", hint: "Small networks survive by listening." }
    ]
  },
  {
    id: "abyss",
    title: "Abyssus Gate",
    place: "Enceladus / Deep sub-ocean",
    palette: "lagoon",
    clue: "The vein recognizes the name before history does. Jark is not behind you. He is downstream.",
    puzzle: "Open Dark's Dream without becoming a god.",
    correct: ["listen", "divide", "descend"],
    reward: { will: 1, insight: 1, mercy: 1 },
    fail: { pressure: 2 },
    actions: [
      { id: "command", label: "Command", hint: "The vein refuses rulers." },
      { id: "listen", label: "Listen", hint: "The living ocean speaks in intervals." },
      { id: "divide", label: "Divide", hint: "One seed to Ceres, one seed below." },
      { id: "descend", label: "Descend", hint: "Find Jark by becoming the place he will seek." }
    ]
  }
];

const endings = {
  found: {
    title: "The Future Answers",
    text:
      "Dark does not find Jark as a body finds another body. She finds the contour he will leave in the world. The route is ready: paper, shrine, mesh, abyss. Someday, when Jark touches the vein, it will already know how to say his name.",
    note: "Best ending: the signal becomes a path."
  },
  strained: {
    title: "A Thread Survives",
    text:
      "The path is incomplete, but not broken. A partial whisper reaches Freetown and a dim architecture waits below Enceladus. Jark may still find her, but he will have to solve more of the silence alone.",
    note: "Mixed ending: enough mercy, not enough clarity."
  },
  lost: {
    title: "The Archive Keeps Her",
    text:
      "The network preserves too much. Dark's model remains brilliant, praised, and useless. Somewhere in a future alley, Jark hears only static where a guide should have been.",
    note: "Failure ending: immortality wins by making the signal neat."
  }
};

const state = {
  room: 0,
  selected: [],
  solved: [],
  insight: 1,
  will: 1,
  mercy: 1,
  pressure: 0,
  message: "Choose actions in the correct order. Hints are honest, but not always kind."
};

const app = document.querySelector("#app");

function addStats(delta) {
  Object.entries(delta).forEach(([key, value]) => {
    state[key] = Math.max(0, Math.min(9, state[key] + value));
  });
}

function currentRoom() {
  return rooms[state.room];
}

function chooseAction(actionId) {
  if (!currentRoom()) return;
  if (state.selected.includes(actionId)) return;
  state.selected.push(actionId);
  const room = currentRoom();

  if (state.selected.length === room.correct.length) {
    const solved = room.correct.every((id, index) => state.selected[index] === id);
    if (solved) {
      addStats(room.reward);
      state.solved.push(room.id);
      state.message = "The room opens. Dark leaves with less certainty and more truth.";
    } else {
      addStats(room.fail);
      state.message = "The pattern resists. Pressure rises, but the failed shape still teaches.";
    }
  } else {
    state.message = "The sequence has begun. Listen for what the next action changes.";
  }
  render();
}

function continuePath() {
  if (!currentRoom()) return;
  const room = currentRoom();
  const complete = state.selected.length === room.correct.length;
  if (!complete) {
    state.message = "Finish the room sequence first.";
    render();
    return;
  }
  state.room += 1;
  state.selected = [];
  state.message = "A new chamber folds open.";
  render();
}

function resetRoom() {
  state.selected = [];
  state.message = "The room resets without forgetting you.";
  render();
}

function resetGame() {
  state.room = 0;
  state.selected = [];
  state.solved = [];
  state.insight = 1;
  state.will = 1;
  state.mercy = 1;
  state.pressure = 0;
  state.message = "Choose actions in the correct order. Hints are honest, but not always kind.";
  render();
}

function endingKey() {
  const score = state.insight + state.will + state.mercy - state.pressure;
  if (state.solved.length >= 3 && score >= 8) return "found";
  if (score >= 4) return "strained";
  return "lost";
}

function stat(label, value) {
  return `
    <div class="stat">
      <span>${label}</span>
      <div class="meter"><i style="width:${(value / 9) * 100}%"></i></div>
      <b>${value}</b>
    </div>
  `;
}

function renderBoard(room) {
  const nodes = rooms.map((item, index) => {
    const active = index === state.room ? "active" : "";
    const done = state.solved.includes(item.id) ? "done" : "";
    return `<button class="map-node ${active} ${done}" type="button" aria-label="${item.title}" disabled>${index + 1}</button>`;
  });
  return `<div class="map">${nodes.join("")}</div>`;
}

function render() {
  const room = currentRoom();
  const finished = !room;
  const ending = finished ? endings[endingKey()] : null;
  const palette = room?.palette ?? "dawn";

  app.innerHTML = `
    <main class="app ${palette}">
      <section class="stage">
        <nav class="topbar">
          <div>
            <p class="eyebrow">Human-Ever-After</p>
            <h1>Dark: Resonance Path</h1>
          </div>
          <button class="ghost" type="button" data-reset aria-label="Restart game" title="Restart">Restart</button>
        </nav>

        <div class="layout">
          <aside class="side">
            <div class="portrait" aria-hidden="true">
              <span></span>
            </div>
            <h2>Dark</h2>
            <p class="role">Late Awakened. Cerebrium phenomenologist. Apostate of forever.</p>
            ${renderBoard(room)}
            <div class="stats">
              ${stat("Insight", state.insight)}
              ${stat("Will", state.will)}
              ${stat("Mercy", state.mercy)}
              ${stat("Pressure", state.pressure)}
            </div>
          </aside>

          <section class="room">
            ${
              finished
                ? `
                  <p class="eyebrow">Ending</p>
                  <h2>${ending.title}</h2>
                  <p class="large">${ending.text}</p>
                  <p class="message">${ending.note}</p>
                  <button class="primary" type="button" data-reset>Walk again</button>
                `
                : `
                  <p class="eyebrow">${room.place}</p>
                  <h2>${room.title}</h2>
                  <p class="large">${room.clue}</p>
                  <div class="puzzle">
                    <h3>${room.puzzle}</h3>
                    <div class="sequence">
                      ${room.correct
                        .map((_, index) => `<span>${state.selected[index] ? state.selected[index] : "..."}</span>`)
                        .join("")}
                    </div>
                    <div class="actions">
                      ${room.actions
                        .map(
                          (action) => `
                            <button class="action" type="button" data-action="${action.id}" ${
                              state.selected.includes(action.id) ? "disabled" : ""
                            }>
                              <strong>${action.label}</strong>
                              <span>${action.hint}</span>
                            </button>
                          `
                        )
                        .join("")}
                    </div>
                  </div>
                  <p class="message">${state.message}</p>
                  <div class="controls">
                    <button class="secondary" type="button" data-room-reset>Reset room</button>
                    <button class="primary" type="button" data-continue>Continue</button>
                  </div>
                `
            }
          </section>
        </div>
      </section>
    </main>
  `;

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => chooseAction(button.dataset.action));
  });
  document.querySelectorAll("[data-reset]").forEach((button) => button.addEventListener("click", resetGame));
  document.querySelector("[data-room-reset]")?.addEventListener("click", resetRoom);
  document.querySelector("[data-continue]")?.addEventListener("click", continuePath);
}

render();
