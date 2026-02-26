import GameLoop from "../engine/GameLoop.js";
import PlayerSquare from "./PlayerSquare.js";

/** MJamGameLoop
 *
 *  Blank game loop for MJam_01. Only runs JuiceEventManager update/render.
 *  Add your game's update and render systems here via addUpdateSystem() / addRenderSystem().
 *
 */

export default class MJamGameLoop extends GameLoop {

	constructor(gameSession) {
		super(gameSession);
		// Systems are registered later via initializeSystems() after all managers exist
	}

	// Called after all managers are registered on the session
	initializeSystems() {
		this.__updateSystems = [];
		this.__renderSystems = [];

		const gs = this.gameSession;

		// Player square
		this.__playerSquare = new PlayerSquare(gs);

		// Update order
		this.addUpdateSystem("input", gs.inputManager, 10);
		this.addUpdateSystem("juiceEvents", gs.juiceEventManager, 20);
		this.addUpdateSystem("playerSquare", this.__playerSquare, 30);

		// Render order
		this.addRenderSystem("juiceEvents", gs.juiceEventManager, 10);
		this.addRenderSystem("playerSquare", this.__playerSquare, 20);
	}
}
