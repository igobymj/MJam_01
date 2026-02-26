import GameLoop from "../engine/GameLoop.js";

/** MJamGameLoop
 *
 *  Game loop for MJam_01.
 *  A dumb runner of registered update/render systems.
 *  Systems are registered externally by MJamSession.setup().
 *
 */

export default class MJamGameLoop extends GameLoop {

	constructor(gameSession) {
		super(gameSession);
	}
}
