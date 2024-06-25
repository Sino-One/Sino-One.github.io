const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const cellSize = 10;

let aliveCells = new Set();
let running = false;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let speed = 500;
let intervalId;
let mouseDown = false;
let modifiedCells = new Set();
let displayMode = "black-white"; // Modes: 'black-white' or 'white-black'

let spaceKeyDown = false; // Variable pour suivre l'état de la touche espace

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawGrid();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

document.getElementById("start").addEventListener("click", () => {
  if (!running) {
    running = true;
    intervalId = setInterval(update, speed);
  }
});

document.getElementById("pause").addEventListener("click", () => {
  running = false;
  clearInterval(intervalId);
});

document.getElementById("reset").addEventListener("click", () => {
  running = false;
  clearInterval(intervalId);
  aliveCells.clear();
  drawGrid();
});

document.getElementById("resetZoom").addEventListener("click", () => {
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  drawGrid();
});

document.getElementById("toggleDisplayMode").addEventListener("click", () => {
  displayMode = displayMode === "black-white" ? "white-black" : "black-white";
  drawGrid();
});

document.getElementById("speed").addEventListener("input", (event) => {
  speed = 1000 - event.target.value;
  if (running) {
    clearInterval(intervalId);
    intervalId = setInterval(update, speed);
  }
});

canvas.addEventListener("mousedown", (event) => {
  mouseDown = true;
  modifiedCells.clear(); // Clear the set of modified cells at the start of a new drag
  toggleCell(event);
});

canvas.addEventListener("mouseup", () => {
  mouseDown = false;
});

canvas.addEventListener("mousemove", (event) => {
  if (mouseDown) {
    drawCellIfNotModified(event);
  }
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  const zoomAmount = -event.deltaY * 0.001;
  const newScale = Math.max(scale + zoomAmount, 0.1);

  const mouseX = event.offsetX;
  const mouseY = event.offsetY;
  const newOffsetX = mouseX - (mouseX - offsetX) * (newScale / scale);
  const newOffsetY = mouseY - (mouseY - offsetY) * (newScale / scale);

  scale = newScale;
  offsetX = newOffsetX;
  offsetY = newOffsetY;
  drawGrid();
});

// Gestion de la touche Espace pour le déplacement
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    spaceKeyDown = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    spaceKeyDown = false;
  }
});

function drawCellIfNotModified(event) {
  const x = Math.floor((event.offsetX - offsetX) / (cellSize * scale));
  const y = Math.floor((event.offsetY - offsetY) / (cellSize * scale));
  const cellKey = `${x},${y}`;
  if (!modifiedCells.has(cellKey)) {
    modifiedCells.add(cellKey);
    toggleCell(event);
  }
}

function toggleCell(event) {
  const x = Math.floor((event.offsetX - offsetX) / (cellSize * scale));
  const y = Math.floor((event.offsetY - offsetY) / (cellSize * scale));
  const cellKey = `${x},${y}`;
  if (aliveCells.has(cellKey)) {
    aliveCells.delete(cellKey);
  } else {
    aliveCells.add(cellKey);
  }
  drawGrid();
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  const aliveColor = displayMode === "black-white" ? "black" : "white";
  const deadColor = displayMode === "black-white" ? "white" : "black";
  ctx.fillStyle = deadColor;
  ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

  const visibleCells = getVisibleCells();

  visibleCells.forEach((cellKey) => {
    const [x, y] = cellKey.split(",").map(Number);
    if (aliveCells.has(cellKey)) {
      ctx.fillStyle = aliveColor;
    } else {
      ctx.fillStyle = deadColor;
    }
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  });

  ctx.restore();

  // Si la touche espace est enfoncée, déplacez la vue
  if (spaceKeyDown) {
    offsetX += 10; // Ajustez la valeur de décalage comme nécessaire
    drawGrid(); // Redessinez pour mettre à jour la vue
  }
}

function getVisibleCells() {
  const visibleCells = new Set();
  const xStart = Math.floor(-offsetX / (cellSize * scale));
  const yStart = Math.floor(-offsetY / (cellSize * scale));
  const xEnd = Math.ceil((canvas.width - offsetX) / (cellSize * scale));
  const yEnd = Math.ceil((canvas.height - offsetY) / (cellSize * scale));

  for (let x = xStart; x <= xEnd; x++) {
    for (let y = yStart; y <= yEnd; y++) {
      visibleCells.add(`${x},${y}`);
    }
  }
  return visibleCells;
}

function update() {
  const newAliveCells = new Set();
  const neighborsCount = {};

  aliveCells.forEach((cellKey) => {
    const [x, y] = cellKey.split(",").map(Number);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const neighborKey = `${x + dx},${y + dy}`;
        neighborsCount[neighborKey] = (neighborsCount[neighborKey] || 0) + 1;
      }
    }
  });

  for (const cellKey in neighborsCount) {
    const count = neighborsCount[cellKey];
    if (count === 3 || (count === 2 && aliveCells.has(cellKey))) {
      newAliveCells.add(cellKey);
    }
  }

  aliveCells = newAliveCells;
  drawGrid();
}

resizeCanvas();
