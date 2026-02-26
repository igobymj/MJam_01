import GameSession from "../engine/GameSession.js";
import MJamGameLoop from "./MJamGameLoop.js";
import MJamJuiceSettings from "./MJamJuiceSettings.js";
import MJamJuiceGuiManager from "./Managers/MJamJuiceGuiManager.js";

export default class MJamSession extends GameSession {

	constructor() {
		if (GameSession.__instance) {
			return GameSession.__instance;
		}

		super();

		// Initialize the game loop systems now that all managers are registered
		this.gameLoop.initializeSystems();

		if (this.verbose === true) {
			console.log("MJam Session Created Successfully.");
		}
	}

	createGameLoop() {
		return new MJamGameLoop(this);
	}

	createJuiceSettings() {
		return new MJamJuiceSettings();
	}

	createJuiceGuiManager() {
		return new MJamJuiceGuiManager(this);
	}
}
