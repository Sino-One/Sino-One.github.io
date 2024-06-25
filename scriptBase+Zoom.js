const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const cellSize = 10;

let grid;
let running = false;
let scale = 1;
let offsetX = 0;
let offsetY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  grid = createGrid();
  drawGrid();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

document.getElementById("start").addEventListener("click", () => {
  running = true;
  requestAnimationFrame(update);
});

document.getElementById("pause").addEventListener("click", () => {
  running = false;
});

document.getElementById("reset").addEventListener("click", () => {
  running = false;
  grid = createGrid();
  drawGrid();
});

document.getElementById("resetZoom").addEventListener("click", () => {
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  drawGrid();
});

canvas.addEventListener("click", (event) => {
  const x = Math.floor((event.offsetX - offsetX) / (cellSize * scale));
  const y = Math.floor((event.offsetY - offsetY) / (cellSize * scale));
  if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
    grid[y][x] = !grid[y][x];
    drawGrid();
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

function createGrid() {
  const rows = Math.ceil(canvas.height / cellSize);
  const cols = Math.ceil(canvas.width / cellSize);
  return Array.from({ length: rows }, () => Array(cols).fill(false));
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  const rows = grid.length;
  const cols = grid[0].length;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.beginPath();
      ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
      ctx.fillStyle = grid[y][x] ? "black" : "white";
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();
}

function update() {
  if (!running) return;

  grid = nextGeneration(grid);
  drawGrid();
  requestAnimationFrame(update);
}

function nextGeneration(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = createGrid();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const neighbors = countNeighbors(grid, x, y);
      if (grid[y][x]) {
        newGrid[y][x] = neighbors === 2 || neighbors === 3;
      } else {
        newGrid[y][x] = neighbors === 3;
      }
    }
  }
  return newGrid;
}

function countNeighbors(grid, x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const ny = y + dy;
      const nx = x + dx;
      if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length) {
        count += grid[ny][nx] ? 1 : 0;
      }
    }
  }
  return count;
}

grid = createGrid();
drawGrid();
