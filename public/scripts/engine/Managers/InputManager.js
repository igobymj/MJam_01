/* 
 * InputManager Class 
 * 
 * Game Input is aggregated to this class, creating a gameObject that includes the current state of various keys or buttons.
 *
 * All objects that wish to query input should use InputManager as their interface.
 * 
*/

import Manager from "./Manager.js";
import InputObject from "./InputObject.js";

const DEADZONE = 0.2;

// Returns 0 if the value is within the deadzone, otherwise returns it unchanged.
function applyDeadzone(value) {
    return Math.abs(value) < DEADZONE ? 0 : value;
}

export default class InputManager extends Manager {

    constructor(gameSession) {
        if (InputManager.__instance) {
            return InputManager.__instance;
        }

        super(gameSession);

        InputManager.__instance = this;

        this.__inputObject = new InputObject();

        if (this.gameSession.verbose === true) {
            console.log("input manager created successfully");
        }
    }

    update() {

        // --- Keyboard (WASD) ---
        // Arrow keys are excluded — they conflict with UI sliders
        this.inputObject.left = this.gameSession.p5.keyIsDown(65);
        this.inputObject.right = this.gameSession.p5.keyIsDown(68);
        this.inputObject.forward = this.gameSession.p5.keyIsDown(87);
        this.inputObject.backward = this.gameSession.p5.keyIsDown(83);

        // --- Gamepad (first connected controller) ---
        const gp = navigator.getGamepads()[0];
        if (gp) {
            // Analog stick axes (deadzone applied)
            this.inputObject.leftStick.x = applyDeadzone(gp.axes[0]);
            this.inputObject.leftStick.y = applyDeadzone(gp.axes[1]);
            this.inputObject.rightStick.x = applyDeadzone(gp.axes[2]);
            this.inputObject.rightStick.y = applyDeadzone(gp.axes[3]);

            // Drive digital booleans from left stick threshold (OR with keyboard)
            if (this.inputObject.leftStick.x < 0) this.inputObject.left = true;
            if (this.inputObject.leftStick.x > 0) this.inputObject.right = true;
            if (this.inputObject.leftStick.y < 0) this.inputObject.forward = true;
            if (this.inputObject.leftStick.y > 0) this.inputObject.backward = true;
        } else {
            // No gamepad — zero out analog fields
            this.inputObject.leftStick.x = 0;
            this.inputObject.leftStick.y = 0;
            this.inputObject.rightStick.x = 0;
            this.inputObject.rightStick.y = 0;
        }
    }

    // for one-shot keypresses e.g. cheats, debug, etc.
    keyInput(keyInputValue) {
        // example for keyInput one shots:
        // if ((keyInputValue === "Enter" || keyInputValue === "Shift") {
        //     this.gameSession.shipManager.ship.fireBullet();
        // }

        /**** CHEAT CODES AND DEBUG ****/

    }



    get inputObject() {
        return this.__inputObject;
    }

    set inputObject(input) {
        this.__inputObject = input;
    }

    get instance() {
        return this.__instance;
    }

    set instance(instance) {
        this.__instance = instance;
    }

}