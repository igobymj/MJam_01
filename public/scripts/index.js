import MJamSession from "./mjam/MJamSession.js";

// Resume Tone.js AudioContext on first user interaction (browser autoplay policy)
function resumeAudioContext() {
	Tone.start();
	document.removeEventListener('click', resumeAudioContext);
	document.removeEventListener('keydown', resumeAudioContext);
}
document.addEventListener('click', resumeAudioContext);
document.addEventListener('keydown', resumeAudioContext);

// Instantiate our Game Session
let gameSession = new MJamSession();

// Define how our p5 sketch will look
var mjam = function (p) {

	// p5 instance is available immediately when the sketch function runs —
	// set it here so GameObjects can be safely constructed before setup().
	gameSession.p5 = p;
	gameSession.gameLoop.lateInitialize();

	p.preload = function () {
		// Load any assets or libraries
	}

	p.setup = function () {
		// Get width and height of canvas div
		let canvasDiv = document.getElementById('canvas');
		let canvasStyle = canvasDiv.currentStyle || window.getComputedStyle(canvasDiv);
		let canvasWidth = parseFloat(canvasStyle.width);
		let canvasPadding = parseFloat(canvasStyle.paddingLeft) + parseFloat(canvasStyle.paddingRight);
		let canvasBorder = parseFloat(canvasStyle.borderLeftWidth) + parseFloat(canvasStyle.borderRightWidth);

		gameSession.canvasWidth = canvasWidth - canvasPadding - canvasBorder;
		gameSession.canvasHeight = (p.windowHeight) * 0.8;

		var canvas = p.createCanvas(gameSession.canvasWidth, gameSession.canvasHeight * .98);
		canvas.parent("canvas");

		// Match juice menu height to canvas height
		let juiceDiv = document.getElementById('juice-menu');
		let canvasEl = document.getElementById('defaultCanvas0');
		juiceDiv.style.height = canvasEl.style.height;

		// Save canvas reference
		gameSession.canvas = canvas;

		// Time scale management
		gameSession.timeManager.timeScale = 1;
		gameSession.timeManager.frameRate = 60;
		gameSession.timeManager.start();

		// p5 configurations
		p.frameRate(60);
		p.imageMode(p.CENTER);
	}

	// Core update function
	p.draw = function () {
		gameSession.timeManager.update();
		gameSession.gameLoop.update();

		p.background(p.color(gameSession.backgroundColor));
		gameSession.gameLoop.render();

		if (gameSession.flashColor != 0) {
			p.fill(gameSession.flashColor);
			p.rect(0, 0, gameSession.canvasWidth, gameSession.canvasHeight);
		}

		// Time scale debug keys
		if (p.key === '0') {
			gameSession.timeManager.timeScale = 1;
		}
		if (p.key === '=') {
			gameSession.timeManager.timeScale += 0.1;
		}
		if (p.key === '-') {
			gameSession.timeManager.timeScale -= 0.05;
		}
	}

	p.keyPressed = function () {
		gameSession.inputManager.keyInput(p.key);
	}

	p.windowResized = function () {
		let canvasDiv = document.getElementById('canvas');
		let canvasStyle = canvasDiv.currentStyle || window.getComputedStyle(canvasDiv);
		let canvasWidth = parseFloat(canvasStyle.width);
		let canvasPadding = parseFloat(canvasStyle.paddingLeft) + parseFloat(canvasStyle.paddingRight);
		let canvasBorder = parseFloat(canvasStyle.borderLeftWidth) + parseFloat(canvasStyle.borderRightWidth);

		gameSession.canvasWidth = canvasWidth - canvasPadding - canvasBorder;
		gameSession.canvasHeight = (p.windowHeight) * 0.8;

		p.resizeCanvas(gameSession.canvasWidth, gameSession.canvasHeight);

		let juiceDiv = document.getElementById('juice-menu');
		let canvasEl = document.getElementById('defaultCanvas0');
		juiceDiv.style.height = canvasEl.style.height;
	}
}

// Instantiate p5 and attach to gameSession
gameSession.p5 = new p5(mjam, 'canvas');

// Initialize GUI
gameSession.juiceGuiManager.initialize();
