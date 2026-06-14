export default class PasteTune {
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
        wrapper.setAttribute('data-item-name', 'paste');

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'ce-popover-item__icon ce-popover-item__icon--tool';
        iconWrapper.innerHTML = `
            <svg style="width: 15px !important" viewBox="0 0 24 24" fill="none">
                <path fill="currentColor" d="M19 2H14.82C14.4 0.84 13.3 0 12 0C10.7 0 9.6 0.84 9.18 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM12 2C12.55 2 13 2.45 13 3C13 3.55 12.55 4 12 4C11.45 4 11 3.55 11 3C11 2.45 11.45 2 12 2ZM19 20H5V4H7V6H17V4H19V20ZM9 9V11H15V9H9ZM9 13V15H15V13H9Z"/>
            </svg>
        `;

        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'ce-popover-item__title';
        titleWrapper.textContent = 'Paste';

        wrapper.appendChild(iconWrapper);
        wrapper.appendChild(titleWrapper);

        wrapper.addEventListener('click', async () => {
            try {
                // Use browser's clipboard API
                const text = await navigator.clipboard.readText();

                const parsed = JSON.parse(text);
                const { tool, data } = parsed;

                if (!tool || !data) {
                    throw new Error('Clipboard block is missing tool or data.');
                }

                // Get the current block index and insert after it
                const currentIndex = this.api.blocks.getCurrentBlockIndex();
                const insertIndex = currentIndex + 1;
                this.api.blocks.insert(tool, data, null, insertIndex, false);

                this.api.toolbar.close();

                // Optional cleanup: remove trailing empty paragraph
                await this.removeTrailingEmptyParagraph();

            } catch (err) {
                console.error('[PasteTune] Failed to paste block:', err);
                this.api.notifications.show({
                    type: 'error',
                    message: 'Invalid clipboard block data',
                    duration: 3000
                });
            }
        });

        return wrapper;
    }

    async removeTrailingEmptyParagraph() {
        const blocksCount = this.api.blocks.getBlocksCount();
        const lastIndex = blocksCount - 1;

        const saved = await this.api.saver.save();
        const lastBlock = saved.blocks?.[lastIndex];

        if (
            lastBlock &&
            lastBlock.type === 'paragraph' &&
            (!lastBlock.data?.text || lastBlock.data.text.trim() === '')
        ) {
            this.api.blocks.delete(lastIndex);
        }
    }

    save() {
        return {};
    }
}
