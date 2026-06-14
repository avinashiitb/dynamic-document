export class UITemplates {
    constructor(instanceId) {
        this.instanceId = instanceId;
    }

    getMainTemplate(data, envOptions, methods, currentMethodIndex) {
        return `
            <div>
                <div>
                    <div class="px-4 py-4 bg-gray-new-50 border-gray-200">
                        <div class="flex items-center space-x-3">
                            <div class="relative">
                                <button id="${this.instanceId}-api-method-btn" class="px-4 py-2 text-sm font-medium rounded-md border cursor-pointer !rounded-button whitespace-nowrap ${methods[currentMethodIndex].class}">
                                    ${data.method}<icon class="fas fa-chevron-down ml-2" id="${this.instanceId}-api-chevron-main"></icon>
                                </button>
                            </div>
                            <div class="flex-1 flex relative">
                                <div class="flex-1 relative">
                                    <div class="flex items-center absolute left-3 top-1/2 transform -translate-y-1/2 space-x-2">
                                        <div class="relative group">
                                            <button id="${this.instanceId}-env-cog-btn" class="base-url cursor-pointer">
                                                <icon class="fa-solid fa-link text-sm" id="${this.instanceId}-base-url"></icon>
                                                <icon class="fas fa-chevron-down ml-2"></icon>
                                            </button>
                                            <span class="api-doc-tooltip group-hover:block hidden absolute left-1/2 top-full mt-1 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">Select base URL</span>
                                        </div>
                                    </div>
                                    <input id="${this.instanceId}-base-url-input" type="text" placeholder="Enter base URL or select environment" class="font-mono font-medium pl-16 flex-1 w-full pl-20 pr-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md" value="${data.url || ''}">
                                    ${this.getEnvironmentDropdownTemplate(envOptions)}
                                </div>
                            </div>
                            <button id="${this.instanceId}-send-btn" class="px-6 py-2 bg-gray-50 border border-gray-200 text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                                <div class="flex items-center space-x-2">
                                    <i class="fas fa-paper-plane"></i><span>Send</span>
                                </div>
                            </button>
                            <button id="${this.instanceId}-toggle-section-btn" class="px-2 py-2 bg-gray-400 hover:text-gray-700 cursor-pointer" style="border: 0px; background: none">
                                <icon id="${this.instanceId}-toggle-chevron" class="fas fa-chevron-down" style="font-size: 16px"></icon>
                            </button>
                        </div>
                    </div>
                </div>

                ${this.getToggleSectionTemplate(data)}
            </div>
        `;
    }

    getEnvironmentDropdownTemplate(envOptions) {
        return `
            <div id="${this.instanceId}-env-dropdown" class="absolute z-10 left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg hidden">
                <div class="p-2">
                    ${envOptions.map(env => `
                        <button class="bg-none border-0 w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer flex items-center justify-between" data-value="${env.value}" data-label="${env.label}" data-id="${env?.id || ''}" data-scope="${env.scope || ''}">
                            <div>
                                <div class="font-medium">${env.label}</div>
                                <div class="text-xs text-gray-500 truncate">${env.value}</div>
                            </div>
                            <icon class="fas fa-check text-blue-600 hidden"></icon>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getToggleSectionTemplate(data) {
        return `
            <div class="p-6 border-t border-gray-200 hidden space-y-8" id="${this.instanceId}-toggle-section">
                ${this.getTabsTemplate()}
                ${this.getParamsSection()}
                ${this.getQuerySection()}
                ${this.getAuthSection(data)}
                ${this.getHeadersSection()}
                ${this.getCookiesSection()}
                ${this.getBodySection(data)}
                ${this.getResponseSection(data)}
            </div>
        `;
    }

    getTabsTemplate() {
        return `
            <div class="flex border-b border-gray-200 mb-6">
                <button id="${this.instanceId}-tab-params" class="tab-btn px-4 py-2 text-sm font-medium bg-none border-0 border-b-2 cursor-pointer whitespace-nowrap border-blue-500 text-blue-600">Params</button>
                <button id="${this.instanceId}-tab-query" class="tab-btn px-4 py-2 text-sm font-medium bg-none border-0 cursor-pointer whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700">Query</button>
                <button id="${this.instanceId}-tab-auth" class="tab-btn px-4 py-2 text-sm font-medium bg-none border-0 cursor-pointer whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700">Authorization</button>
                <button id="${this.instanceId}-tab-headers" class="tab-btn px-4 py-2 text-sm font-medium bg-none border-0 cursor-pointer whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700">Headers</button>
                <button id="${this.instanceId}-tab-cookies" class="tab-btn px-4 py-2 text-sm font-medium bg-none border-0 cursor-pointer whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700">Cookies</button>
                <button id="${this.instanceId}-tab-body" class="tab-btn px-4 py-2 text-sm font-medium bg-none border-0 cursor-pointer whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700">Body</button>
            </div>
        `;
    }

    getParamsSection() {
        return `
            <div id="${this.instanceId}-section-params" class="tab-section">
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="m-0 text-sm font-medium text-gray-700">Path Parameters</h3>
                        <button id="${this.instanceId}-add-param-btn" class="text-sm text-blue-600 hover:text-blue-700 cursor-pointer bg-none border-0">
                            <icon class="fas fa-plus mr-1"></icon>Add Parameter
                        </button>
                    </div>
                    <div class="space-y-3" id="${this.instanceId}-param-list">
                        <!-- Param rows will be inserted here -->
                    </div>
                </div>
            </div>
        `;
    }

    getQuerySection() {
        return `
            <div id="${this.instanceId}-section-query" class="tab-section hidden">
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="m-0 text-sm font-medium text-gray-700">Query Parameters</h3>
                        <button id="${this.instanceId}-add-query-btn" class="text-sm text-blue-600 hover:text-blue-700 cursor-pointer bg-none border-0">
                            <icon class="fas fa-plus mr-1"></icon>Add Query
                        </button>
                    </div>
                    <div class="space-y-3" id="${this.instanceId}-query-list">
                        <!-- Query rows will be inserted here -->
                    </div>
                </div>
            </div>
        `;
    }

    getAuthSection(data) {
        return `
            <div id="${this.instanceId}-section-auth" class="tab-section hidden">
                <div class="space-y-4" id="${this.instanceId}-auth-content">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-medium text-gray-700">Authorization Type</h3>
                        <button id="${this.instanceId}-auth-type-btn" class="px-3 py-2 text-sm rounded-md border cursor-pointer !rounded-button whitespace-nowrap bg-gray-50 text-gray-700 border-gray-200">
                            ${data.request.authorization.type}<icon class="fas fa-chevron-down ml-2"></icon>
                        </button>
                    </div>
                    <div id="${this.instanceId}-auth-extra" class="mt-4"></div>
                </div>
            </div>
        `;
    }

    getHeadersSection() {
        return `
            <div id="${this.instanceId}-section-headers" class="tab-section hidden">
                <div class="space-y-4">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-sm font-medium text-gray-700">Request Headers</h3>
                        <button id="${this.instanceId}-add-header-btn" class="text-sm text-blue-600 hover:text-blue-700 cursor-pointer bg-none border-0">
                            <icon class="fas fa-plus mr-1"></icon>Add Header
                        </button>
                    </div>
                    <div class="space-y-3" id="${this.instanceId}-header-list">
                        <!-- Header rows will be inserted here -->
                    </div>
                </div>
            </div>
        `;
    }

    getCookiesSection() {
        return `
            <div id="${this.instanceId}-section-cookies" class="tab-section hidden">
                <div class="space-y-4">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-sm font-medium text-gray-700">Request Cookies</h3>
                        <button id="${this.instanceId}-add-cookie-btn" class="text-sm text-blue-600 hover:text-blue-700 cursor-pointer bg-none border-0">
                            <icon class="fas fa-plus mr-1"></icon>Add Cookie
                        </button>
                    </div>
                    <div class="space-y-3" id="${this.instanceId}-cookie-list">
                        <!-- Cookie rows will be inserted here -->
                    </div>
                </div>
            </div>
        `;
    }

    getBodySection(data) {
        return `
            <div id="${this.instanceId}-section-body" class="tab-section hidden">
                <div class="space-y-4">
                    <h3 class="text-sm font-medium text-gray-700 mb-2">Request Body</h3>
                    <textarea id="${this.instanceId}-req-body-editor" style="display: none;">${data.request.body ? data.request.body : ''}</textarea>
                    <div id="${this.instanceId}-req-body-editor-container" class="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></div>
                </div>
            </div>
        `;
    }

    getResponseSection(data) {
        return `
            <div class="space-y-4 pt-6 border-t border-gray-200">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <h3 class="text-sm font-medium text-gray-700">Response Preview</h3>
                        <div class="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                            <icon class="fas fa-circle text-green-500 text-xs"></icon>
                            <span class="text-xs text-gray-600">Live</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2 px-3 py-1 bg-gray-new-50 rounded-md">
                            <icon class="fas fa-clock text-gray-400"></icon>
                            <span class="text-sm text-gray-600">${data.response.timeTaken || '-'}ms</span>
                        </div>
                        <div class="flex items-center space-x-2 px-3 py-1 bg-gray-new-50 rounded-md">
                            <icon class="fas fa-signal text-gray-400"></icon>
                            <span class="text-sm text-gray-600">Status: ${data.response.status || '-'}</span>
                        </div>
                    </div>
                </div>
                ${this.getResponseTabsTemplate(data)}
            </div>
        `;
    }

    getResponseTabsTemplate(data) {
        return `
            <div class="bg-white rounded-lg shadow-sm">
                <div class="flex px-1 pt-1">
                    <button id="${this.instanceId}-response-tab-body" class="px-4 py-2 text-sm font-medium border-0 rounded-t-lg cursor-pointer transition-colors duration-200 bg-gray-new-50 text-blue-600">
                        <div class="flex items-center space-x-2">
                            <icon class="fas fa-code"></icon><span>Body</span>
                        </div>
                    </button>
                    <button id="${this.instanceId}-response-tab-headers" class="bg-white px-4 py-2 text-sm font-medium border-0 rounded-t-lg cursor-pointer transition-colors duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                        <div class="flex items-center space-x-2">
                            <icon class="fas fa-list"></icon><span>Headers</span>
                        </div>
                    </button>
                </div>
                <div id="${this.instanceId}-response-body-section" class="bg-gray-new-50 p-4 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="text-sm font-medium text-gray-700">Response Body</h4>
                        <div class="flex items-center space-x-2">
                            <button class="bg-none border-0 text-sm text-gray-500 hover:text-gray-700">
                                <icon class="fas fa-expand"></icon>
                            </button>
                            <button class="bg-none border-0 text-sm text-gray-500 hover:text-gray-700">
                                <icon class="fas fa-chevron-down"></icon>
                            </button>
                        </div>
                    </div>
                    <textarea id="${this.instanceId}-body-editor" style="display: none;">${data.response.body && typeof data.response.body === 'object' ? JSON.stringify(data.response.body, null, 2) : (data.response.body || 'No response data available')}</textarea>
                    <div id="${this.instanceId}-body-editor-container" class="border border-gray-300 rounded-md overflow-hidden max-h-96"></div>
                </div>
                <div id="${this.instanceId}-response-headers-section" class="bg-gray-new-50 p-4 rounded-lg hidden">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <span class="text-xs text-gray-500">Response Headers</span>
                        </div>
                        <button class="bg-none border-0 text-xs text-blue-600 hover:text-blue-700">
                            <icon class="fas fa-copy mr-1"></icon>Copy
                        </button>
                    </div>
                    <pre class="font-mono m-0 text-sm whitespace-pre-wrap text-gray-900">${Object.keys(data.response.headers).length > 0 ? JSON.stringify(data.response.headers, null, 2) : 'No headers available'}</pre>
                </div>
            </div>
        `;
    }

    getPopupTemplate() {
        return `
            <div id="${this.instanceId}-env-popup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] hidden" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;">
                <div class="bg-white rounded-lg p-6 w-96 font-sans">
                    <div class="flex items-center justify-between mb-4 h-8">
                        <h3 class="text-lg font-medium">Add New Environment</h3>
                        <button id="${this.instanceId}-close-popup-btn" class="bg-none border-0 text-gray-400 hover:text-gray-600 cursor-pointer">
                            <icon class="fas fa-times"></icon>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Environment Name</label>
                            <input id="${this.instanceId}-env-name-input" type="text" placeholder="e.g., QA, Testing, Custom" class="w-full box-border px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                            <input id="${this.instanceId}-env-url-input" type="text" placeholder="https://api.example.com" class="w-full box-border px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button id="${this.instanceId}-cancel-popup-btn" class="bg-none border-0 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer !rounded-button whitespace-nowrap">Cancel</button>
                        <button id="${this.instanceId}-save-env-btn" class="border-0 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 cursor-pointer !rounded-button whitespace-nowrap">Add Environment</button>
                    </div>
                </div>
            </div>
        `;
    }
}
