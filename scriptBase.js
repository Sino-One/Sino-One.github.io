const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const cellSize = 10;
const width = 60;
const height = 40;
canvas.width = cellSize * width;
canvas.height = cellSize * height;

let grid = createGrid();
let running = false;

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

canvas.addEventListener("click", (event) => {
  const x = Math.floor(event.offsetX / cellSize);
  const y = Math.floor(event.offsetY / cellSize);
  grid[y][x] = !grid[y][x];
  drawGrid();
});

function createGrid() {
  return Array.from({ length: height }, () => Array(width).fill(false));
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      ctx.beginPath();
      ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
      ctx.fillStyle = grid[y][x] ? "black" : "white";
      ctx.fill();
      ctx.stroke();
    }
  }
}

function update() {
  if (!running) return;

  grid = nextGeneration(grid);
  drawGrid();
  requestAnimationFrame(update);
}

function nextGeneration(grid) {
  const newGrid = createGrid();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
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
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        count += grid[ny][nx] ? 1 : 0;
      }
    }
  }
  return count;
}

drawGrid();
