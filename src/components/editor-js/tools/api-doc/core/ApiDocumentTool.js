import "./codemirror-imports.js";
import "../api-doc.css";
import { EnvironmentManager } from '../services/EnvironmentManager.js';
import { ApiRequestService } from '../services/ApiRequestService.js';
import { UIRenderer } from '../ui/UIRenderer.js';
import { EventManager } from '../events/EventManager.js';
import { CodeMirrorManager } from '../utils/CodeMirrorManager.js';

class ApiDocumentTool {
    static get toolbox() {
        return {
            title: 'API Document',
            icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><rect width="24" height="24" fill="none"></rect><path d="M20,6H4A2,2,0,0,0,2,8v8a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V8A2,2,0,0,0,20,6ZM9.29,14.8,9,13.73H7.16L6.87,14.8H5.17L7,9.07H9.09L11,14.8Zm6.34-3.14a1.7,1.7,0,0,1-.36.64,1.82,1.82,0,0,1-.67.44,2.75,2.75,0,0,1-1,.17h-.44V14.8H11.6V9.09h2a2.43,2.43,0,0,1,1.62.47,1.67,1.67,0,0,1,.55,1.35A2.36,2.36,0,0,1,15.63,11.66Zm2.58,3.14H16.66V9.09h1.55ZM8.45,11.53l.24.93H7.48l.24-.93c0-.13.08-.28.12-.47s.09-.38.13-.57a4.63,4.63,0,0,0,.1-.48c0,.13.07.29.11.5l.15.58Zm5.59-1a.57.57,0,0,1,.16.43.75.75,0,0,1-.11.42.59.59,0,0,1-.27.22.9.9,0,0,1-.37.07h-.31V10.34h.4A.63.63,0,0,1,14,10.51Z" fill-rule="evenodd"></path></g></svg>'
        };
    }

    constructor({ data, config = {}, api }) {
        // Generate unique ID for this instance
        this.instanceId = 'api-doc-' + Math.random().toString(36).substr(2, 9);
        this.fileId = config.fileId;
        this.api = api; // Store EditorJS API reference

        // Initialize data with defaults
        this.data = this._initializeData(data, config);

        // Initialize managers
        this.environmentManager = new EnvironmentManager(this.fileId);
        this.apiRequestService = new ApiRequestService();
        this.uiRenderer = new UIRenderer(this.instanceId);
        this.eventManager = new EventManager(this.instanceId, this);
        this.codeMirrorManager = new CodeMirrorManager(this.instanceId);

    }

    _initializeData(data, config) {
        const defaultData = {
            method: config.defaultMethod || 'GET',
            url: '',
            request: {
                params: [],
                query: [],
                authorization: {
                    type: config.defaultAuth || 'No Auth',
                    value: []
                },
                headers: [],
                cookies: [],
                body: ''
            },
            response: {
                status: null,
                timeTaken: null,
                headers: {},
                body: {}
            }
        };
        console.log("Initializing data for API Document Tool", defaultData, data);
        return {
            ...defaultData,
            ...(data || {}),
            request: {
                ...defaultData.request,
                ...(data?.request || {}),
                params: Array.isArray(data?.request?.params) ? data.request.params : defaultData.request.params,
                query: Array.isArray(data?.request?.query) ? data.request.query : defaultData.request.query,
                headers: Array.isArray(data?.request?.headers) ? data.request.headers : defaultData.request.headers,
                cookies: Array.isArray(data?.request?.cookies) ? data.request.cookies : defaultData.request.cookies,
                authorization: {
                    type: data?.request?.authorization?.type || defaultData.request.authorization.type,
                    value: Array.isArray(data?.request?.authorization?.value) ? data.request.authorization.value : defaultData.request.authorization.value
                }
            },
            response: {
                ...defaultData.response,
                ...(data?.response || {}),
                headers: data?.response?.headers || defaultData.response.headers,
                body: data?.response?.body || defaultData.response.body
            }
        };
    }

    render() {
        const container = document.createElement('div');

        // Initialize the UI immediately
        this.uiRenderer.render(container, this.data, []);

        // Load environment options and update UI asynchronously
        this.environmentManager.fetchEnvironmentVariables().then(() => {
            // Re-render the environment dropdown with loaded options
            const envDropdown = container.querySelector(`#${this.instanceId}-env-dropdown .p-2`);
            if (envDropdown) {
                const envOptions = this.environmentManager.getEnvOptions();
                envDropdown.innerHTML = envOptions.map(env => `
                    <button class="bg-none border-0 w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer flex items-center justify-between" data-value="${env.value}" data-label="${env.label}" data-id="${env?.id || ''}" data-scope="${env.scope || ''}">
                        <div>
                            <div class="font-medium">${env.label}</div>
                            <div class="text-xs text-gray-500 truncate">${env.value}</div>
                        </div>
                        <icon class="fas fa-check text-blue-600 hidden"></icon>
                    </button>
                `).join('');

                // Re-attach environment event listeners after updating dropdown
                const baseUrlInput = container.querySelector(`#${this.instanceId}-base-url-input`);
                this.eventManager.attachEnvironmentEventListeners(envDropdown, baseUrlInput, this.environmentManager);
            }
        });

        // Setup event listeners
        this.eventManager.setupEventListeners(container, this.environmentManager, this.apiRequestService, this.codeMirrorManager);

        return container;
    }

    updateResponseData(responseData) {
        this.data.response = responseData;
        this.uiRenderer.updateResponseUI(responseData, this.codeMirrorManager.getResponseEditor());

        // Trigger EditorJS change event to ensure data is saved
        // The data will be automatically saved when the save() method is called by EditorJS
        // We just need to update our internal data, which we've already done above
    }

    save() {
        return this.data;
    }
}

export default ApiDocumentTool;
