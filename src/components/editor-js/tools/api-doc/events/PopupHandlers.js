export class PopupHandlers {
    constructor(instanceId) {
        this.instanceId = instanceId;
    }

    setupPopupEventListeners(environmentManager) {
        const popup = document.querySelector(`#${this.instanceId}-env-popup`);
        if (popup) {
            this.setupCloseButton(popup);
            this.setupCancelButton(popup);
            this.setupSaveButton(popup, environmentManager);
            this.setupOutsideClickClose(popup);
        } else {
            console.error('Popup element not found in setupPopupEventListeners');
        }
    }

    setupCloseButton(popup) {
        const closeBtn = popup.querySelector(`#${this.instanceId}-close-popup-btn`);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                popup.classList.add('hidden');
            });
        }
    }

    setupCancelButton(popup) {
        const cancelBtn = popup.querySelector(`#${this.instanceId}-cancel-popup-btn`);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                popup.classList.add('hidden');
            });
        }
    }

    setupSaveButton(popup, environmentManager) {
        const saveBtn = popup.querySelector(`#${this.instanceId}-save-env-btn`);
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const nameInput = popup.querySelector(`#${this.instanceId}-env-name-input`);
                const urlInput = popup.querySelector(`#${this.instanceId}-env-url-input`);

                const name = nameInput.value.trim();
                const url = urlInput.value.trim();

                if (!name || !url) {
                    alert('Please fill in both Environment Name and Base URL');
                    return;
                }

                try {
                    // Save to database
                    await environmentManager.saveEnvironmentVariable(name, url, 'file', environmentManager.fileId);

                    // Update the dropdown
                    await environmentManager.updateEnvironmentDropdown(this.instanceId);

                    // Clear inputs and close popup
                    nameInput.value = '';
                    urlInput.value = '';
                    popup.classList.add('hidden');

                } catch (error) {
                    console.error('Error saving environment:', error);
                    alert('Error saving environment: ' + error.message);
                }
            });
        }
    }

    setupOutsideClickClose(popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.add('hidden');
            }
        });
    }
}
