// MJamJuiceSettings.js
// MJam_01-specific juice settings. Extends the engine base.
// Add game events to createDefaultContainer() and particle systems to createDefaultParticleSystems().
// TODO: Load event configs from mjam-juice.json when there are real effects to configure.

import JuiceSettings from "../engine/JuiceSettings.js";

export default class MJamJuiceSettings extends JuiceSettings {

	createDefaultContainer() {
		const base = super.createDefaultContainer();
		return {
			...base,
			cheats: {
				...base.cheats,
				sound: {
					on: true
				}
			}
		};
	}

	createDefaultParticleSystems() {
		// Start empty — add particle system definitions here as you build them
		const base = super.createDefaultParticleSystems();
		return {
			...base
		};
	}
}
