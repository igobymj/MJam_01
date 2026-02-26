/**
 * InputObject
 *
 * Snapshot of the current input state, written each frame by InputManager
 * and read by any game object that needs it.
 *
 * Digital fields (boolean) — driven by keyboard or stick threshold:
 *   left, right, forward, backward
 *
 * Analog fields (float, -1.0 to 1.0, deadzone applied) — driven by gamepad:
 *   leftStick.x,  leftStick.y
 *   rightStick.x, rightStick.y
 */

export default class InputObject {

    constructor() {
        // --- Digital ---
        this.left = false;
        this.right = false;
        this.forward = false;
        this.backward = false;

        // --- Analog ---
        this.leftStick = { x: 0, y: 0 };
        this.rightStick = { x: 0, y: 0 };
    }
}
