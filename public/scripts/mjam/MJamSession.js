import GameSession from "../engine/GameSession.js";
import MJamGameLoop from "./MJamGameLoop.js";
import MJamJuiceSettings from "./MJamJuiceSettings.js";
import MJamJuiceGuiManager from "./Managers/MJamJuiceGuiManager.js";
import PlayerSquare from "./PlayerSquare.js";
import { play as playDrone } from "../synaesthesia/drone.js";

export default class MJamSession extends GameSession {

	constructor() {
		if (GameSession.__instance) {
			return GameSession.__instance;
		}

		super();

		// Drone state — null means not playing
		this.__stopDrone = null;

		if (this.verbose === true) {
			console.log("MJam Session Created Successfully.");
		}
	}

	/**
	 * Called once from p.setup() after p5 and canvas dimensions are ready.
	 * This is the single place where all systems, game objects, and services are initialized.
	 */
	setup() {
		const gl = this.gameLoop;

		// Update systems (priority order)
		gl.addUpdateSystem("input", this.inputManager, 10);
		gl.addUpdateSystem("juiceEvents", this.juiceEventManager, 20);

		// Game objects (require p5 to be live)
		this.__playerSquare = new PlayerSquare(this);
		gl.addUpdateSystem("playerSquare", this.__playerSquare, 30);
		gl.addRenderSystem("playerSquare", this.__playerSquare, 20);

		// Render systems
		gl.addRenderSystem("juiceEvents", this.juiceEventManager, 10);

		// Time
		this.timeManager.timeScale = 1;
		this.timeManager.frameRate = 60;
		this.timeManager.start();

		// GUI
		this.juiceGuiManager.initialize();

		// Start the drone (sound.on defaults to true)
		this.startDrone();
	}

	// --- Factory overrides ---

	createGameLoop() {
		return new MJamGameLoop(this);
	}

	createJuiceSettings() {
		return new MJamJuiceSettings();
	}

	createJuiceGuiManager() {
		return new MJamJuiceGuiManager(this);
	}

	// --- Drone control ---

	get isDronePlaying() {
		return this.__stopDrone !== null;
	}

	startDrone() {
		if (this.isDronePlaying) return;
		this.__stopDrone = playDrone();
		this.juiceSettings.container.cheats.sound.on = true;
		this._syncDroneCheckbox();
		console.log("[drone] started");
	}

	stopDrone() {
		if (!this.isDronePlaying) return;
		this.__stopDrone();
		this.__stopDrone = null;
		this.juiceSettings.container.cheats.sound.on = false;
		this._syncDroneCheckbox();
		console.log("[drone] stopped");
	}

	toggleDrone() {
		if (this.isDronePlaying) {
			this.stopDrone();
		} else {
			this.startDrone();
		}
	}

	_syncDroneCheckbox() {
		const el = document.getElementById("control-container-cheats-sound-on");
		if (el) el.checked = this.isDronePlaying;
	}
}
