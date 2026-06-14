export default class CopyTune {
    static get isTune() {
        return true;
    }

    constructor({ api, data, config, block }) {
        this.api = api;
        this.block = block;
        this.config = config || {};
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'ce-popover-item';
        wrapper.setAttribute('data-item-name', 'copy');

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'ce-popover-item__icon ce-popover-item__icon--tool';
        iconWrapper.innerHTML = `
            <svg style="width: 15px !important" viewBox="0 0 24 24" fill="none">
                <path fill="currentColor" d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.1 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z"/>
                <path fill="currentColor" d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z"/>
            </svg>
        `;

        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'ce-popover-item__title';
        titleWrapper.textContent = 'Copy';

        wrapper.appendChild(iconWrapper);
        wrapper.appendChild(titleWrapper);

        wrapper.addEventListener('click', async () => {
            try {
                const data = await this.getBlockData();
                const json = JSON.stringify(data, null, 2);

                // Use browser's clipboard API
                await navigator.clipboard.writeText(json);
                this.showCopyNotification();
            } catch (err) {
                console.error('[CopyTune] Copy failed:', err);
                this.showErrorNotification();
            }
        });

        return wrapper;
    }

    async getBlockData() {
        try {
            const result = await this.block.save();
            return result || {};
        } catch (error) {
            console.error('[CopyTune] Error getting block data:', error);
            return {};
        }
    }

    showCopyNotification() {
        const notification = document.createElement('div');
        notification.textContent = 'Block data copied!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgb(107, 28, 255);
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showErrorNotification() {
        const notification = document.createElement('div');
        notification.textContent = 'Failed to copy block data';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e53e3e;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    save() {
        return {};
    }
}
