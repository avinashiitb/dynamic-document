export default class HeaderSwitcherTune {
    static get isTune() {
        return true;
    }

    constructor({ api, data, config, block }) {
        this.api = api;
        this.block = block;
        this.config = config || {};
    }

    render() {
        const wrapper = document.createElement("div");
        wrapper.className = "cdx-header-switcher-tune";

        const button = document.createElement("button");
        button.type = "button";
        button.innerText = "H⇄";
        button.className = "cdx-tune-button";
        button.title = "Change heading level";
        button.style.cssText = `
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            color: #374151;
            transition: all 0.2s ease;
        `;

        button.addEventListener("mouseenter", () => {
            button.style.background = "#e5e7eb";
        });

        button.addEventListener("mouseleave", () => {
            button.style.background = "#f3f4f6";
        });

        button.addEventListener("click", () => {
            this._showOptions();
        });

        wrapper.appendChild(button);
        return wrapper;
    }

    _showOptions() {
        const levels = [1, 2, 3, 4, 5, 6];

        // Remove existing popup if any
        const existingPopup = document.querySelector('.cdx-header-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popup = document.createElement("div");
        popup.className = "cdx-header-popup";
        popup.style.cssText = `
            position: absolute;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 8px;
            z-index: 1000;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 120px;
        `;

        levels.forEach((level) => {
            const btn = document.createElement("button");
            btn.innerText = `Heading ${level}`;
            btn.style.cssText = `
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                padding: 6px 12px;
                cursor: pointer;
                font-size: 14px;
                text-align: left;
                transition: all 0.2s ease;
                color: #374151;
            `;

            btn.addEventListener("mouseenter", () => {
                btn.style.background = "#f3f4f6";
                btn.style.borderColor = "#d1d5db";
            });

            btn.addEventListener("mouseleave", () => {
                btn.style.background = "#ffffff";
                btn.style.borderColor = "#e5e7eb";
            });

            btn.addEventListener("click", () => {
                const data = this.block.data;
                data.level = level;
                this.block.update(data);
                popup.remove();
            });
            popup.appendChild(btn);
        });

        document.body.appendChild(popup);

        // Position the popup
        const blockRect = this.block.holder.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();

        let top = blockRect.top - popupRect.height - 10;
        let left = blockRect.left;

        // Adjust if popup goes off screen
        if (top < 0) {
            top = blockRect.bottom + 10;
        }
        if (left + popupRect.width > window.innerWidth) {
            left = window.innerWidth - popupRect.width - 10;
        }

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;

        // Close popup when clicking outside
        const closePopup = (e) => {
            if (!popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        };

        // Delay adding event listener to prevent immediate closure
        setTimeout(() => {
            document.addEventListener('click', closePopup);
        }, 100);
    }

    save() {
        return {};
    }
}
