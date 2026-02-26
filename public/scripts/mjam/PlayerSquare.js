import GameObject from "../engine/GameObject.js";

/**
 * PlayerSquare
 *
 * A simple square steered by WASD keys. Used as a first interactivity test.
 */

const SIZE = 40;   // side-length in pixels
const SPEED = 4;    // pixels per frame (at 60 fps)

export default class PlayerSquare extends GameObject {

    constructor(gameSession) {
        // We don't know canvas dimensions yet (setup() hasn't run), so park at
        // (0, 0) and re-center on the first update.
        super(gameSession, 0, 0, SIZE, SIZE, 0, 1, 255);
        this.__centered = false;
    }

    // ------------------------------------------------------------------ update
    update() {
        // On first update, canvas dimensions are known — center the square.
        if (!this.__centered) {
            const gs = this.gameSession;
            this.x = gs.canvasWidth / 2;
            this.y = gs.canvasHeight / 2;
            this.__centered = true;
        }

        const input = this.gameSession.inputManager.inputObject;

        if (input.left) { this.x -= SPEED; }
        if (input.right) { this.x += SPEED; }
        if (input.forward) { this.y -= SPEED; }
        if (input.backward) { this.y += SPEED; }

        // Clamp to canvas bounds so the square never escapes
        const half = SIZE / 2;
        const gs = this.gameSession;
        this.x = Math.max(half, Math.min(gs.canvasWidth - half, this.x));
        this.y = Math.max(half, Math.min(gs.canvasHeight - half, this.y));
    }

    // ------------------------------------------------------------------ render
    render() {
        const p = this.p5;
        p.push();

        // Outer glow
        p.noStroke();
        p.fill(100, 200, 255, 60);
        p.rect(this.x - SIZE * 0.7, this.y - SIZE * 0.7, SIZE * 1.4, SIZE * 1.4, 8);

        // Main square body
        p.fill(100, 200, 255, 220);
        p.stroke(200, 240, 255, 180);
        p.strokeWeight(2);
        p.rect(this.x - SIZE / 2, this.y - SIZE / 2, SIZE, SIZE, 4);

        p.pop();
    }
}
