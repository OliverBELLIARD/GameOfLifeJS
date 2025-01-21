const canvas = document.getElementById("game_of_life");
const ctx = canvas.getContext("2d");

/////////////////////////////////////////////////////////////////
/////////////////////// GAME CONSTANTS //////////////////////////
/////////////////////////////////////////////////////////////////
// Dimensions: scale
const scale = 10;
// Canvas scaling
ctx.scale(scale, scale);

// Canvas normalized dimensions
const tWidth = canvas.clientWidth / scale;
const tHeight = canvas.clientHeight / scale;

const defaultInterval = 1000;

/////////////////////////////////////////////////////////////////
/////////////////////// GAME VARIABLES //////////////////////////
/////////////////////////////////////////////////////////////////
let interval = 1000;
let lastTime = 0;
let count = 0;
let loopCount = 0;
let cellsCount = 0;
let pause = 1;
let drawCursor = 0;

// Mouse
let mouse = { x: 0, y: 0, action: 1 };
/* colored *
let colors = {
	cells: "#32cd32", // lime green
	bg: "#778899", // light slate grey
};
*/
/* Light mode
let colors = {
	cells: "black", // lime green
	bg: "white", // light slate grey
};
*/
/* Dark mode */
let colors = {
	cells: "grey", // lime green
	bg: "black", // light slate grey
	grid: "#707070",
};

// Create a sigle cell board
let board = [];
// Generate a board the size of canvas
for (let i = 0; i < tWidth; i++) {
	board.push([]);
	for (let j = 0; j < tHeight; j++) {
		board[i].push(0);
	}
}

// Pieces
pulsar3 = [
	[0, 0, 1, 1, 1, 0],
	[0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1],
	[0, 0, 1, 1, 1, 0],
];

glider = [
	[0, 1, 0],
	[0, 0, 1],
	[1, 1, 1],
];

/////////////////////////////////////////////////////////////////
/////////////////////// GAME FUNCTIONS //////////////////////////
/////////////////////////////////////////////////////////////////
// Drawing matrix and matrix operations
function drawMatrix(matrix, x, y) {
	for (let i = 0; i < matrix.length; i++) {
		for (let j = 0; j < matrix[i].length; j++) {
			if (matrix[i][j]) {
				cellsCount++;
				ctx.fillStyle = colors.cells;
				ctx.fillRect(x + j, y + i, 1, 1);
			}
		}
	}
}

function rotateMatrix(matrix, dir) {
	let newMatrix = [];

	for (let i in matrix) newMatrix.push([]);

	if (dir === 1) {
		for (let i = 0; i < matrix.length; i++) {
			for (let j = 0; j < matrix[i].length; j++) {
				newMatrix[j][matrix.length - i - 1] = matrix[i][j];
			}
		}
	} else {
		for (let i = 0; i < matrix.length; i++) {
			for (let j = 0; j < matrix[i].length; j++) {
				newMatrix[matrix.length - j - 1][i] = matrix[i][j];
			}
		}
	}

	return newMatrix;
}

function mergeBoard(matrix, x, y) {
	for (let i = 0; i < matrix.length; i++) {
		for (let j = 0; j < matrix[i].length; j++) {
			board[y + i + 1][x + j + 1] = board[y + i + 1][x + j + 1] || matrix[i][j];
		}
	}
}

function clearBoard(matrix) {
	for (let i = 0; i < matrix.length; i++) {
		for (let j = 0; j < matrix[i].length; j++) {
			matrix[i][j] = 0;
		}
	}
}

// Draw a grid a grid
function drawGrid() {
	ctx.strokeStyle = colors.grid;
	ctx.lineWidth = 0.01;

	for (let i = 0; i < tWidth; i++) {
		for (let j = 0; j < tHeight; j++) {
			if (1 + (i % 2) && 1 + (j % 2)) {
				ctx.beginPath();
				ctx.strokeRect(i, j, 1, 1);
			}
		}
	}
}

// Count non-null values cells around a single cell
function proxCount(board, x, y) {
	count = 0;

	try {
		if (board[x - 1][y + 1]) count++;
	} catch (error) {}
	try {
		if (board[x][y + 1]) count++;
	} catch (error) {}
	try {
		if (board[x + 1][y + 1]) count++;
	} catch (error) {}
	try {
		if (board[x + 1][y]) count++;
	} catch (error) {}
	try {
		if (board[x + 1][y - 1]) count++;
	} catch (error) {}
	try {
		if (board[x][y - 1]) count++;
	} catch (error) {}
	try {
		if (board[x - 1][y - 1]) count++;
	} catch (error) {}
	try {
		if (board[x - 1][y]) count++;
	} catch (error) {}

	return count;
}

// Update mouse position variable
function updateCursorPos(canvas, event) {
	const rect = canvas.getBoundingClientRect();

	// Get mouse coordinates
	/* /!\ Coordinates are flatten to integers to match the grid */
	mouse.x = Math.floor((event.clientX - rect.left) / scale);
	mouse.y = Math.floor((event.clientY - rect.top) / scale);
}

// Draw a grid a grid
function drawGrid() {
	ctx.strokeStyle = colors.grid;
	ctx.lineWidth = 0.01;

	for (let i = 0; i < tWidth; i++) {
		for (let j = 0; j < tHeight; j++) {
			if (1 + (i % 2) && 1 + (j % 2)) {
				ctx.beginPath();
				ctx.strokeRect(i, j, 1, 1);
			}
		}
	}
}

// Add paterns to the board
function addPaterns() {
	// Pulsar 3
	let x = 29;
	let y = 27;
	mergeBoard(pulsar3, x, y);
	mergeBoard(rotateMatrix(pulsar3, 1), x + pulsar3.length + 1, y);
	mergeBoard(
		rotateMatrix(rotateMatrix(pulsar3, 1), 1),
		x + pulsar3.length + 1,
		pulsar3.length + 1 + y
	);
	mergeBoard(
		rotateMatrix(rotateMatrix(rotateMatrix(pulsar3, 1), 1), 1),
		x,
		pulsar3.length + 1 + y
	);

	// Glider
	mergeBoard(glider, 1, 2);
}

// update function: game loop, updates each frame
function update(time = 0) {
	const dt = time - lastTime;
	lastTime = time;
	count += dt;

	if (count >= interval && pause % 2) {
		count = 0;

		let newBoard = [];
		let n = 0;

		for (let i = 0; i < board.length; i++) {
			newBoard.push([]);

			for (let j = 0; j < board[i].length; j++) {
				newBoard[i].push(0);

				n = proxCount(board, i, j);
				//if (n) console.log("x:", i, ", y:", j, ", n:", n);

				if (n == 3) newBoard[i][j] = 1;
				else if (n == 2 && board[i][j]) newBoard[i][j] = 1;
				else if (n < 2 || n > 3) newBoard[i][j] = 0;
			}
		}

		board = newBoard;
		loopCount++;

		// Debugging
		console.log(
			"loops:",
			loopCount,
			"; cells:",
			cellsCount,
			"; paused:",
			(pause - 1) / 2,
			"times"
		);
	}

	// Draw background
	ctx.fillStyle = colors.bg;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// While mouse hold: draw cells at mouse position
	if (drawCursor) {
		board[mouse.y][mouse.x] = mouse.action;
	}

	// Draw cells
	cellsCount = 0;
	drawMatrix(board, 0, 0);

	// Draw grid
	drawGrid();

	// Update next frame
	requestAnimationFrame(update);
}

/////////////////////////////////////////////////////////////////
///////////////////////// GAME INPUTS ///////////////////////////
/////////////////////////////////////////////////////////////////
// Keyboard inputs
document.addEventListener("keydown", (event) => {
	if (event.keyCode === 37 && interval - 1) {
		// On arow left key pressed
	} else if (event.keyCode === 39 && interval - 1) {
		// On arow right key pressed
	} else if (event.keyCode === 38) {
		// On arow up key pressed
		interval += 100;
	} else if (event.keyCode === 40) {
		// On arow down key pressed
		interval -= 100;
	} else if (event.keyCode === 32) {
		// On space key pressed
		pause++;
	} else if (event.keyCode === 68) {
		// On "D" key pressed
		// Change mouse action (1=add, 0=delete)
		mouse.action = Math.abs(mouse.action - 1);
	} else if (event.keyCode === 82) {
		// On "R" key pressed
		// Change mouse action (1=add, 0=delete)
		clearBoard(board);
	}
});

// Mouse inputs
canvas.addEventListener("mousedown", function (event) {
	updateCursorPos(canvas, event);
	drawCursor = 1;
});

// Mouse inputs
canvas.addEventListener("mousemove", function (event) {
	updateCursorPos(canvas, event);
});

// Mouse inputs
canvas.addEventListener("mouseup", function (event) {
	updateCursorPos(canvas, event);

	// Debugging:
	//console.log("x: " + mouse.x + " y: " + mouse.y);
	drawCursor = 0;
});

/////////////////////////////////////////////////////////////////
///////////////////// GAME INITIALIZATION ///////////////////////
/////////////////////////////////////////////////////////////////
// Pieces integration to the board
addPaterns();
// Start game loop
update();
