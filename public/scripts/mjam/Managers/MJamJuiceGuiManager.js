// MJamJuiceGuiManager.js
// Schema-driven UI manager for MJam_01 juice controls.
// Currently renders only the Cheats group (Juice FX toggle + Sound On).
// TODO: Add effect-specific schema entries here, or load from mjam-juice.json.

export default class MJamJuiceGuiManager {

    static __accordionId = 0;

    constructor(gameSession) {
        if (MJamJuiceGuiManager.__instance) {
            return MJamJuiceGuiManager.__instance;
        }
        MJamJuiceGuiManager.__instance = this;
        this.gameSession = gameSession;

        // Schema maps UI structure to JuiceSettings data paths.
        // Add effect collapse groups here as you build game effects.
        this.schema = [
            {
                label: "Cheats",
                type: "group",
                children: [
                    {
                        label: "Juice FX",
                        path: "container.cheats.juiceFx",
                        type: "checkbox"
                    },
                    {
                        label: "Sound On",
                        path: "container.cheats.sound.on",
                        type: "checkbox",
                        onChange: (checked) => checked ? this.gameSession.startDrone() : this.gameSession.stopDrone()
                    }
                ]
            }
            // TODO: Add effect schema entries here, e.g.:
            // {
            //     label: "My Effect",
            //     type: "collapse",
            //     id: "myEffect",
            //     children: [
            //         { label: "Active", path: "container.myEffect.active", type: "checkbox" }
            //     ]
            // }
        ];
    }

    initialize() {
        this.buildPathLabels();
        this._lastLogPath = null;

        const parentElement = document.getElementById('juice-menu');
        if (!parentElement) return;

        parentElement.innerHTML = '';

        // Pinned section (Cheats group)
        const pinnedItems = this.schema.filter(item => item.type === 'group');
        const pinnedDiv = document.createElement('div');
        pinnedDiv.className = 'juice-pinned';
        const pinnedForm = document.createElement('form');
        pinnedDiv.appendChild(pinnedForm);
        this.buildUI(pinnedItems, pinnedForm);
        parentElement.appendChild(pinnedDiv);

        // Scrollable section (effect collapse groups)
        const scrollableItems = this.schema.filter(item => item.type !== 'group');
        const scrollableDiv = document.createElement('div');
        scrollableDiv.className = 'juice-scrollable';
        const scrollForm = document.createElement('form');
        scrollableDiv.appendChild(scrollForm);
        this.buildUI(scrollableItems, scrollForm);
        parentElement.appendChild(scrollableDiv);
    }

    buildUI(schemaItems, parent, depth = 0) {
        schemaItems.forEach(item => {
            if (item.type === 'group') {
                this.createGroup(item, parent, depth);
            } else if (item.type === 'collapse') {
                this.createCollapse(item, parent, depth);
            } else {
                this.createControl(item, parent);
            }
        });
    }

    createGroup(item, parent, depth) {
        const div = document.createElement('div');
        div.className = 'juice-item';
        this.buildUI(item.children, div, depth);
        parent.appendChild(div);
    }

    createCollapse(item, parent, depth) {
        if (!parent.id) {
            parent.id = `accordion-${MJamJuiceGuiManager.__accordionId++}`;
        }

        const wrapper = document.createElement('div');
        wrapper.className = depth === 0
            ? 'collapse-section collapse-section-top'
            : 'collapse-section';

        const labelDiv = document.createElement('label');
        labelDiv.className = 'form-check-label collapse-toggle';

        const link = document.createElement('a');
        link.setAttribute('aria-expanded', 'false');
        link.className = 'collapse-label';
        link.setAttribute('data-bs-toggle', 'collapse');
        link.setAttribute('data-bs-target', `#${item.id}`);
        link.textContent = item.label;
        link.style.cursor = "pointer";

        labelDiv.appendChild(link);
        wrapper.appendChild(labelDiv);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'juice-effect collapse';
        contentDiv.id = item.id;
        contentDiv.setAttribute('data-bs-parent', `#${parent.id}`);
        contentDiv.style.paddingLeft = "10px";

        this.buildUI(item.children, contentDiv, depth + 1);

        // Disable sibling controls when "Active" toggle is off
        const activeChild = item.children.find(c => c.label === 'Active' && c.path && c.path.endsWith('.active'));
        if (activeChild) {
            const activeId = `control-${activeChild.path.replace(/\./g, '-')}`;
            const activeInput = contentDiv.querySelector(`#${activeId}`);
            if (activeInput) {
                const getSiblings = () =>
                    [...contentDiv.querySelectorAll('input, select')].filter(
                        el => el !== activeInput && el.closest('.collapse') === contentDiv
                    );
                const setDisabled = (disabled) => {
                    getSiblings().forEach(el => el.disabled = disabled);
                    contentDiv.classList.toggle('juice-inactive', disabled);
                };
                setDisabled(!activeInput.checked);
                activeInput.addEventListener('change', () => setDisabled(!activeInput.checked));
            }
        }

        if (depth === 0) {
            contentDiv.addEventListener('hide.bs.collapse', () => {
                contentDiv.querySelectorAll('.collapse.show').forEach(nested => {
                    const bsCollapse = bootstrap.Collapse.getInstance(nested);
                    if (bsCollapse) bsCollapse.hide();
                });
            });
        }

        wrapper.appendChild(contentDiv);
        parent.appendChild(wrapper);
    }

    createControl(item, parent) {
        const wrapper = document.createElement('div');
        wrapper.className = 'mb-2';

        const id = `control-${item.path.replace(/\./g, '-')}`;
        const currentValue = this.getValue(item.path);

        const label = document.createElement('label');
        label.className = 'form-label';
        label.htmlFor = id;
        label.textContent = item.label;
        if (item.type !== 'checkbox') wrapper.appendChild(label);

        let input;

        if (item.type === 'select') {
            input = document.createElement('select');
            input.className = 'form-select';
            item.options.forEach(opt => {
                const option = document.createElement('option');
                const optValue = (opt !== null && typeof opt === 'object') ? opt.value : opt;
                const optLabel = (opt !== null && typeof opt === 'object') ? opt.label : opt;
                option.value = optValue;
                option.textContent = optLabel;
                if (String(optValue) === String(currentValue)) option.selected = true;
                input.appendChild(option);
            });
            input.addEventListener('change', (e) => {
                const raw = e.target.value;
                const val = isNaN(raw) || raw === '' ? raw : parseFloat(raw);
                this.setValue(item.path, val);
            });
        }
        else if (item.type === 'range') {
            input = document.createElement('input');
            input.type = 'range';
            input.className = 'form-range';
            input.min = item.min;
            input.max = item.max;
            if (item.step) input.step = item.step;

            const invert = item.invert === true;
            const toSlider = (v) => invert ? (item.min + item.max - v) : v;
            input.value = toSlider(currentValue);
            input.addEventListener('input', (e) => {
                this.setValue(item.path, toSlider(parseFloat(e.target.value)));
            });
        }
        else if (item.type === 'checkbox') {
            wrapper.className = 'juice-item';
            label.className = 'form-check-label';

            input = document.createElement('input');
            input.className = 'form-check-input';
            input.type = 'checkbox';
            input.checked = currentValue;
            input.id = id;

            input.addEventListener('change', (e) => {
                this.setValue(item.path, e.target.checked);
                if (item.onChange) item.onChange(e.target.checked);
                if (e.target.checked && item.excludes) {
                    item.excludes.forEach(exPath => {
                        this.setValue(exPath, false);
                        const exEl = document.getElementById(`control-${exPath.replace(/\./g, '-')}`);
                        if (exEl) exEl.checked = false;
                    });
                }
            });

            wrapper.appendChild(label);
            wrapper.appendChild(input);
        }

        input.id = id;
        if (item.type !== 'checkbox') wrapper.appendChild(input);
        parent.appendChild(wrapper);
    }

    getValue(path) {
        const keys = path.split('.');
        let obj = this.gameSession.juiceSettings;
        for (let key of keys) {
            if (obj === undefined) return null;
            obj = obj[key];
        }
        return obj;
    }

    setValue(path, value) {
        const keys = path.split('.');
        let obj = this.gameSession.juiceSettings;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;

        // Auto-enable the global Juice FX toggle when any effect is activated
        if (path.endsWith('.active') && value === true) {
            this.gameSession.juiceSettings.container.cheats.juiceFx = true;
            const juiceFxEl = document.getElementById('control-container-cheats-juiceFx');
            if (juiceFxEl) juiceFxEl.checked = true;
        }

        // Log the change to the footer
        const message = this.formatChange(path, value);
        if (message) this.logChange(path, message);
    }

    // Walk the schema tree to build a flat path → label context map (for log messages)
    buildPathLabels() {
        this.pathLabels = {};
        const walk = (items, parents = []) => {
            items.forEach(item => {
                if (item.children) {
                    walk(item.children, [...parents, item.label]);
                } else if (item.path) {
                    this.pathLabels[item.path] = { parents, label: item.label, type: item.type };
                }
            });
        };
        walk(this.schema);
    }

    formatChange(path, value) {
        const info = this.pathLabels[path];
        if (!info) return null;

        const context = info.parents.filter(p => p !== 'Cheats').join(' ');
        const displayValue = typeof value === 'number'
            ? (Number.isInteger(value) ? value : parseFloat(value.toFixed(2)))
            : value;

        if (path.endsWith('.active') && info.label === 'Active') {
            return `${context} ${value ? 'enabled' : 'disabled'}`;
        } else if (info.type === 'checkbox') {
            return `${context} ${info.label} ${value ? 'enabled' : 'disabled'}`;
        } else {
            return `${context} ${info.label} set to ${displayValue}`;
        }
    }

    logChange(path, message) {
        const log = document.getElementById('juice-log');
        if (!log) return;

        if (this._lastLogPath === path && log.lastElementChild) {
            log.lastElementChild.textContent = message;
        } else {
            const p = document.createElement('p');
            p.textContent = message;
            log.appendChild(p);
            while (log.children.length > 50) {
                log.removeChild(log.firstChild);
            }
        }

        this._lastLogPath = path;
        log.scrollTop = log.scrollHeight;
    }
}
