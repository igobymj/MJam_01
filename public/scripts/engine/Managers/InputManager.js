/* 
 * InputManager Class 
 * 
 * Game Input is aggregated to this class, creating a gameObject that includes the current state of various keys or buttons.
 *
 * All objects that wish to query input should use InputManager as their interface.
 * 
*/

import Manager from "./Manager.js";
import NullGameObject from "../NullGameObject.js";

export default class InputManager extends Manager {

    constructor(gameSession) {
        if (InputManager.__instance) {
            return InputManager.__instance;
        }

        super(gameSession);

        InputManager.__instance = this;

        //currently unused
        this.__inputObject = {};

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

        // --- Gamepad (left stick, first connected controller) ---
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0];
        if (gp) {
            const deadzone = 0.2;
            if (gp.axes[0] < -deadzone) this.inputObject.left = true;
            if (gp.axes[0] > deadzone) this.inputObject.right = true;
            if (gp.axes[1] < -deadzone) this.inputObject.forward = true;
            if (gp.axes[1] > deadzone) this.inputObject.backward = true;
        }
    }

    // for one-shot keypresses
    keyInput(keyInputValue) {
        // fire bullet (only when ship is alive)
        if ((keyInputValue === "Enter" || keyInputValue === "Shift") && this.gameSession.shipManager.ship.shipAlive) {
            this.gameSession.shipManager.ship.fireBullet();
        }

        /**** CHEAT CODES AND DEBUG ****/
        if (keyInputValue === "p") {
            let nullObject = new NullGameObject(this.gameSession, this.gameSession.p5.createVector(250, 250));
            this.gameSession.juiceEventManager.addNew("particleTester", nullObject);
        }

        if (keyInputValue === 'z') {
            let nullObject = new NullGameObject(this.gameSession, this.gameSession.p5.createVector(300, 300));
            this.gameSession.juiceEventManager.addNew("asteroidHit", nullObject);
        }

        // cheat code to switch eyeballs on and off (code is for a toggle)
        if (keyInputValue === "g") {
            let eyeBallFlag = this.gameSession.juiceSettings.container.eyeBallsOnAsteroids.eyeBalls.active;
            eyeBallFlag = !eyeBallFlag;
            this.gameSession.juiceSettings.updateJuice("eyeBallsOnAsteroids", "eyeBalls", "active", eyeBallFlag);
        }
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