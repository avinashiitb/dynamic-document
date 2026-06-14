export class FormHandlers {
    constructor(instanceId, toolInstance) {
        this.instanceId = instanceId;
        this.toolInstance = toolInstance;
    }

    setupFormHandlers(container, apiRequestService) {
        this.setupParamsHandlers(container);
        this.setupQueryHandlers(container, apiRequestService);
        this.setupHeadersHandlers(container);
        this.setupCookiesHandlers(container);
        this.setupAuthHandlers(container);
        this.setupSendButtonHandler(container, apiRequestService);
    }

    setupParamsHandlers(container) {
        const paramList = container.querySelector(`#${this.instanceId}-param-list`);
        const addParamBtn = container.querySelector(`#${this.instanceId}-add-param-btn`);

        if (paramList && addParamBtn) {
            // Load existing params
            this.toolInstance.data.request.params.forEach(param => {
                paramList.appendChild(this.createParamRow(param));
            });

            // Add initial param row if none exist
            if (this.toolInstance.data.request.params.length === 0) {
                const newParam = { key: '', value: '' };
                this.toolInstance.data.request.params.push(newParam);
                paramList.appendChild(this.createParamRow(newParam));
            }

            addParamBtn.addEventListener('click', () => {
                const newParam = { key: '', value: '' };
                this.toolInstance.data.request.params.push(newParam);
                paramList.appendChild(this.createParamRow(newParam));
            });
        }
    }

    createParamRow(param) {
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-3';
        row.innerHTML = `
            <input type="text" placeholder="Key (e.g. id)" class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${param.key || ''}">
            <input type="text" placeholder="Value" class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${param.value || ''}">
            <button class="text-gray-400 hover:text-red-500 cursor-pointer p-2 bg-none border-0">
                <icon class="fas fa-times"></icon>
            </button>
        `;

        const keyInput = row.querySelector('input:first-child');
        const valueInput = row.querySelector('input:last-of-type');

        keyInput.addEventListener('input', () => { param.key = keyInput.value; });
        valueInput.addEventListener('input', () => { param.value = valueInput.value; });

        row.querySelector('button').addEventListener('click', () => {
            const index = this.toolInstance.data.request.params.indexOf(param);
            if (index > -1) {
                this.toolInstance.data.request.params.splice(index, 1);
            }
            row.remove();
        });

        return row;
    }

    setupQueryHandlers(container, apiRequestService) {
        const queryList = container.querySelector(`#${this.instanceId}-query-list`);
        const addQueryBtn = container.querySelector(`#${this.instanceId}-add-query-btn`);

        if (queryList && addQueryBtn) {
            // Load existing queries
            this.toolInstance.data.request.query.forEach(query => {
                queryList.appendChild(this.createQueryRow(query, apiRequestService));
            });

            // Add initial query row if none exist
            if (this.toolInstance.data.request.query.length === 0) {
                const newQuery = { key: '', value: '' };
                this.toolInstance.data.request.query.push(newQuery);
                queryList.appendChild(this.createQueryRow(newQuery, apiRequestService));
            }

            addQueryBtn.addEventListener('click', () => {
                const newQuery = { key: '', value: '' };
                this.toolInstance.data.request.query.push(newQuery);
                queryList.appendChild(this.createQueryRow(newQuery, apiRequestService));
                this.updateUrlWithQueryParams(apiRequestService);
            });
        }
    }

    createQueryRow(query, apiRequestService) {
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-3';
        row.innerHTML = `
            <input type="text" placeholder="Key (e.g. page)" class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${query.key || ''}">
            <input type="text" placeholder="Value" class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${query.value || ''}">
            <button class="text-gray-400 hover:text-red-500 cursor-pointer p-2 bg-none border-0">
                <icon class="fas fa-times"></icon>
            </button>
        `;

        const keyInput = row.querySelector('input:first-child');
        const valueInput = row.querySelector('input:last-of-type');

        keyInput.addEventListener('input', () => {
            query.key = keyInput.value;
            this.updateUrlWithQueryParams(apiRequestService);
        });

        valueInput.addEventListener('input', () => {
            query.value = valueInput.value;
            this.updateUrlWithQueryParams(apiRequestService);
        });

        row.querySelector('button').addEventListener('click', () => {
            const index = this.toolInstance.data.request.query.indexOf(query);
            if (index > -1) {
                this.toolInstance.data.request.query.splice(index, 1);
            }
            row.remove();
            this.updateUrlWithQueryParams(apiRequestService);
        });

        return row;
    }

    updateUrlWithQueryParams(apiRequestService) {
        const baseUrlInput = document.querySelector(`#${this.instanceId}-base-url-input`);
        const newUrl = apiRequestService.updateUrlWithQueryParams(
            this.toolInstance.data.url,
            this.toolInstance.data.request.query
        );
        this.toolInstance.data.url = newUrl;
        if (baseUrlInput) {
            baseUrlInput.value = newUrl;
        }
    }

    setupHeadersHandlers(container) {
        const headerList = container.querySelector(`#${this.instanceId}-header-list`);
        const addHeaderBtn = container.querySelector(`#${this.instanceId}-add-header-btn`);

        if (headerList && addHeaderBtn) {
            // Load existing headers
            this.toolInstance.data.request.headers.forEach(header => {
                headerList.appendChild(this.createHeaderRow(header));
            });

            // Add initial header row if none exist
            if (this.toolInstance.data.request.headers.length === 0) {
                const newHeader = { key: '', value: '' };
                this.toolInstance.data.request.headers.push(newHeader);
                headerList.appendChild(this.createHeaderRow(newHeader));
            }

            addHeaderBtn.addEventListener('click', () => {
                const newHeader = { key: '', value: '' };
                this.toolInstance.data.request.headers.push(newHeader);
                headerList.appendChild(this.createHeaderRow(newHeader));
            });
        }
    }

    createHeaderRow(header) {
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-3';
        row.innerHTML = `
            <input type="text" placeholder="Key" class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${header.key || ''}">
            <input type="text" placeholder="Value" class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${header.value || ''}">
            <button class="text-gray-400 hover:text-red-500 cursor-pointer p-2 bg-none border-0">
                <icon class="fas fa-times"></icon>
            </button>
        `;

        const keyInput = row.querySelector('input:first-child');
        const valueInput = row.querySelector('input:last-of-type');

        keyInput.addEventListener('input', () => {
            header.key = keyInput.value;
        });

        valueInput.addEventListener('input', () => {
            header.value = valueInput.value;
        });

        row.querySelector('button').addEventListener('click', () => {
            const index = this.toolInstance.data.request.headers.indexOf(header);
            if (index > -1) {
                this.toolInstance.data.request.headers.splice(index, 1);
            }
            row.remove();
        });

        return row;
    }

    setupAuthHandlers(container) {
        const authTypes = [
            { name: 'No Auth', class: 'bg-gray-new-50 text-gray-700 border-gray-200', extra: '' },
            { name: 'Bearer Token', class: 'bg-blue-50 text-blue-700 border-blue-200', extra: '<input type="text" placeholder="Bearer Token" class="w-full px-3 py-2 border rounded auth-input" data-auth-field="0" />' },
            { name: 'Basic Auth', class: 'bg-blue-50 text-blue-700 border-blue-200', extra: '<input type="text" placeholder="Username" class="w-full px-3 py-2 border rounded mb-2 auth-input" data-auth-field="0" /><input type="password" placeholder="Password" class="w-full px-3 py-2 border rounded auth-input" data-auth-field="1" />' },
            { name: 'API Key', class: 'bg-blue-50 text-blue-700 border-blue-200', extra: '<input type="text" placeholder="API Key" class="w-full px-3 py-2 border rounded auth-input" data-auth-field="0" />' }
        ];

        let currentAuth = authTypes.findIndex(t => t.name === this.toolInstance.data.request.authorization.type);
        if (currentAuth === -1) currentAuth = 0;

        const authBtn = container.querySelector(`#${this.instanceId}-auth-type-btn`);
        const authExtra = container.querySelector(`#${this.instanceId}-auth-extra`);

        if (authBtn && authExtra) {
            const updateAuthBtn = () => {
                const t = authTypes[currentAuth];
                const previousType = this.toolInstance.data.request.authorization.type;

                // Clear authorization values when changing type (except on initial load)
                if (previousType && previousType !== t.name) {
                    this.toolInstance.data.request.authorization.value = [];
                    this.removeAuthorizationHeaders();
                }

                this.toolInstance.data.request.authorization.type = t.name;
                authBtn.innerHTML = `${t.name}<icon class="fas fa-chevron-down ml-2"></icon>`;
                authBtn.className = `px-3 py-2 text-sm rounded-md border cursor-pointer !rounded-button whitespace-nowrap ${t.class}`;
                authExtra.innerHTML = t.extra;

                // Setup input event listeners and restore values
                this.setupAuthInputListeners(authExtra);
                this.restoreAuthValues(authExtra);
            };

            authBtn.addEventListener('click', () => {
                currentAuth = (currentAuth + 1) % authTypes.length;
                updateAuthBtn();
            });

            updateAuthBtn();
        }
    }

    setupAuthInputListeners(authExtra) {
        const inputs = authExtra.querySelectorAll('.auth-input');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const fieldIndex = parseInt(e.target.getAttribute('data-auth-field'));
                const value = e.target.value;

                // Initialize value array if needed
                if (!this.toolInstance.data.request.authorization.value) {
                    this.toolInstance.data.request.authorization.value = [];
                }

                // Update the specific field
                this.toolInstance.data.request.authorization.value[fieldIndex] = value;

                // Update headers automatically
                this.updateAuthorizationHeaders();
            });
        });
    }

    restoreAuthValues(authExtra) {
        const inputs = authExtra.querySelectorAll('.auth-input');
        const authValues = this.toolInstance.data.request.authorization.value || [];

        inputs.forEach(input => {
            const fieldIndex = parseInt(input.getAttribute('data-auth-field'));
            if (authValues[fieldIndex]) {
                input.value = authValues[fieldIndex];
            }
        });
    }

    updateAuthorizationHeaders() {
        const authType = this.toolInstance.data.request.authorization.type;
        const authValues = this.toolInstance.data.request.authorization.value || [];

        // Remove existing authorization headers
        this.removeAuthorizationHeaders();

        // Add new authorization header based on type
        if (authType !== 'No Auth' && authValues.length > 0) {
            let headerKey = '';
            let headerValue = '';

            switch (authType) {
                case 'Bearer Token':
                    if (authValues[0]) {
                        headerKey = 'Authorization';
                        headerValue = `Bearer ${authValues[0]}`;
                    }
                    break;
                case 'Basic Auth':
                    if (authValues[0] && authValues[1]) {
                        headerKey = 'Authorization';
                        const credentials = btoa(`${authValues[0]}:${authValues[1]}`);
                        headerValue = `Basic ${credentials}`;
                    }
                    break;
                case 'API Key':
                    if (authValues[0]) {
                        headerKey = 'X-API-Key';
                        headerValue = authValues[0];
                    }
                    break;
            }

            if (headerKey && headerValue) {
                // Add to headers array
                this.toolInstance.data.request.headers.push({
                    key: headerKey,
                    value: headerValue,
                    isAuthHeader: true
                });

                // Update headers UI
                this.refreshHeadersUI();
            }
        }
    }

    removeAuthorizationHeaders() {
        // Remove headers that were added by authorization
        this.toolInstance.data.request.headers = this.toolInstance.data.request.headers.filter(
            header => !header.isAuthHeader &&
                header.key !== 'Authorization' &&
                header.key !== 'X-API-Key'
        );

        // Update headers UI
        this.refreshHeadersUI();
    }

    refreshHeadersUI() {
        const headerList = document.querySelector(`#${this.instanceId}-header-list`);
        if (headerList) {
            // Clear existing header rows
            headerList.innerHTML = '';

            // Re-add all headers
            this.toolInstance.data.request.headers.forEach(header => {
                const row = this.createHeaderRow(header);
                if (header.isAuthHeader) {
                    // Make auth headers read-only
                    const inputs = row.querySelectorAll('input');
                    inputs.forEach(input => {
                        input.readOnly = true;
                        input.style.backgroundColor = '#f9fafb';
                        input.style.color = '#6b7280';
                    });

                    // Hide delete button for auth headers
                    const deleteBtn = row.querySelector('button');
                    if (deleteBtn) {
                        deleteBtn.style.display = 'none';
                    }
                }
                headerList.appendChild(row);
            });

            // Add empty row if no headers exist
            if (this.toolInstance.data.request.headers.length === 0) {
                const newHeader = { key: '', value: '' };
                this.toolInstance.data.request.headers.push(newHeader);
                headerList.appendChild(this.createHeaderRow(newHeader));
            }
        }
    }

    setupCookiesHandlers(container) {
        const cookieList = container.querySelector(`#${this.instanceId}-cookie-list`);
        const addCookieBtn = container.querySelector(`#${this.instanceId}-add-cookie-btn`);

        if (cookieList && addCookieBtn) {
            // Load existing cookies
            this.toolInstance.data.request.cookies.forEach(cookie => {
                cookieList.appendChild(this.createCookieRow(cookie));
            });

            // Add initial cookie row if none exist
            if (this.toolInstance.data.request.cookies.length === 0) {
                const newCookie = { key: '', value: '' };
                this.toolInstance.data.request.cookies.push(newCookie);
                cookieList.appendChild(this.createCookieRow(newCookie));
            }

            addCookieBtn.addEventListener('click', () => {
                const newCookie = { key: '', value: '' };
                this.toolInstance.data.request.cookies.push(newCookie);
                cookieList.appendChild(this.createCookieRow(newCookie));
            });
        }
    }

    createCookieRow(cookie) {
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-3';
        row.innerHTML = `
            <input type="text" placeholder="Cookie Name" class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${cookie.key || ''}">
            <input type="text" placeholder="Cookie Value" class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${cookie.value || ''}">
            <button class="text-gray-400 hover:text-red-500 cursor-pointer p-2 bg-none border-0">
                <icon class="fas fa-times"></icon>
            </button>
        `;

        const keyInput = row.querySelector('input:first-child');
        const valueInput = row.querySelector('input:last-of-type');

        keyInput.addEventListener('input', () => {
            cookie.key = keyInput.value;
        });

        valueInput.addEventListener('input', () => {
            cookie.value = valueInput.value;
        });

        row.querySelector('button').addEventListener('click', () => {
            const index = this.toolInstance.data.request.cookies.indexOf(cookie);
            if (index > -1) {
                this.toolInstance.data.request.cookies.splice(index, 1);
            }
            row.remove();
        });

        return row;
    }

    refreshAllLists(container) {
        this.refreshParamsUI(container);
        this.refreshQueryUI(container);
        this.refreshHeadersUI();
        this.refreshCookiesUI(container);
    }

    refreshParamsUI(container) {
        const paramList = container.querySelector(`#${this.instanceId}-param-list`);
        if (paramList) {
            paramList.innerHTML = '';
            this.toolInstance.data.request.params.forEach(param => {
                paramList.appendChild(this.createParamRow(param));
            });

            if (this.toolInstance.data.request.params.length === 0) {
                const newParam = { key: '', value: '' };
                this.toolInstance.data.request.params.push(newParam);
                paramList.appendChild(this.createParamRow(newParam));
            }
        }
    }

    refreshQueryUI(container) {
        const queryList = container.querySelector(`#${this.instanceId}-query-list`);
        if (queryList) {
            queryList.innerHTML = '';
            this.toolInstance.data.request.query.forEach(query => {
                queryList.appendChild(this.createQueryRow(query));
            });

            if (this.toolInstance.data.request.query.length === 0) {
                const newQuery = { key: '', value: '' };
                this.toolInstance.data.request.query.push(newQuery);
                queryList.appendChild(this.createQueryRow(newQuery));
            }
        }
    }

    refreshCookiesUI(container) {
        const cookieList = container.querySelector(`#${this.instanceId}-cookie-list`);
        if (cookieList) {
            cookieList.innerHTML = '';
            this.toolInstance.data.request.cookies.forEach(cookie => {
                cookieList.appendChild(this.createCookieRow(cookie));
            });

            if (this.toolInstance.data.request.cookies.length === 0) {
                const newCookie = { key: '', value: '' };
                this.toolInstance.data.request.cookies.push(newCookie);
                cookieList.appendChild(this.createCookieRow(newCookie));
            }
        }
    }

    setupSendButtonHandler(container, apiRequestService) {
        const sendBtn = container.querySelector(`#${this.instanceId}-send-btn`);
        if (sendBtn) {
            sendBtn.addEventListener('click', async () => {
                try {
                    const responseData = await apiRequestService.executeRequest(this.toolInstance.data);
                    this.toolInstance.updateResponseData(responseData);
                } catch (error) {
                    console.error("API request error:", error);
                    const errorResponse = apiRequestService.createErrorResponse(error.message || 'Request failed');
                    this.toolInstance.updateResponseData(errorResponse);
                }
            });
        }
    }
}
