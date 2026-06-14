const ipcRenderer = {
    invoke: (channel, ...args) => window.pluginAPI.messaging.invoke(channel, ...args)
};

export class EnvironmentManager {
    constructor(fileId) {
        this.fileId = fileId;
        this.envOptions = [];
    }

    async saveEnvironmentVariable(key, value, scopeType = 'file', scopeId = null) {
        try {
            const response = await ipcRenderer.invoke('saveEnvVariable', {
                key,
                value,
                scopeType,
                scopeId: scopeId || this.fileId
            });
            console.log('Saved env variable:', response);
            return response;
        } catch (error) {
            console.error('Error saving environment variable:', error);
            return null;
        }
    }

    async fetchEnvironmentVariables() {
        try {
            console.log("Fetch env variable", this.fileId);
            this.envOptions = await ipcRenderer.invoke('fetch-env-variables', {
                scopeType: 'file',
                scopeId: this.fileId
            });
            console.log("envoptions 1", this.envOptions);
        } catch (error) {
            console.error('Error fetching environment variables:', error);
        }

        // Fallback to default options if none exist
        if (!this.envOptions || this.envOptions.length === 0) {
            this.envOptions = [
                { value: "http://localhost:3000", label: "Local", description: "http://localhost:3000" }
            ];
        } else {
            // Map DB rows to dropdown format
            this.envOptions = this.envOptions.map(env => ({
                value: env.value,
                label: env.key,
                description: env.value,
                id: env.id,
                scope: env.scope_type
            }));
        }
        console.log("envoptions-2", this.envOptions);
    }

    async updateEnvironmentDropdown(instanceId) {
        await this.fetchEnvironmentVariables();

        // Update the dropdown UI
        const envDropdown = document.querySelector(`#${instanceId}-env-dropdown .p-2`);
        if (envDropdown) {
            envDropdown.innerHTML = this.envOptions.map(env => `
                <button class="bg-none border-0 w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer flex items-center justify-between" data-value="${env.value}" data-label="${env.label}" data-id="${env?.id || ''}" data-scope="${env.scope || ''}">
                    <div>
                        <div class="font-medium">${env.label}</div>
                        <div class="text-xs text-gray-500 truncate">${env.value}</div>
                    </div>
                    <icon class="fas fa-check text-blue-600 hidden"></icon>
                </button>
            `).join('');
        }
    }

    getEnvOptions() {
        return this.envOptions;
    }

    extractPathFromUrl(url, baseUrl) {
        let rest = '';
        try {
            const urlObj = new URL(url);
            if (baseUrl) {
                rest = decodeURIComponent(urlObj.pathname + urlObj.search + urlObj.hash);
            } else {
                rest = '';
            }
        } catch (err) {
            // If not a valid URL, try to extract the path manually
            const match = url.match(/^https?:\/\/[^/]+(.*)$/);
            rest = match ? match[1] : '';
        }
        return rest;
    }
}
