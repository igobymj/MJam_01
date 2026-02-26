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

		// Update order
		this.addUpdateSystem("input", gs.inputManager, 10);
		this.addUpdateSystem("juiceEvents", gs.juiceEventManager, 20);

		// Render order
		this.addRenderSystem("juiceEvents", gs.juiceEventManager, 10);
	}

	// Called from p.setup() after gameSession.p5 is assigned —
	// GameObjects can only be constructed once p5 is live.
	lateInitialize() {
		this.__playerSquare = new PlayerSquare(this.gameSession);
		this.addUpdateSystem("playerSquare", this.__playerSquare, 30);
		this.addRenderSystem("playerSquare", this.__playerSquare, 20);
	}
}
