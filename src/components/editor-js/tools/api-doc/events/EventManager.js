import { FormHandlers } from './FormHandlers.js';
import { PopupHandlers } from './PopupHandlers.js';

export class EventManager {
    constructor(instanceId, toolInstance) {
        this.instanceId = instanceId;
        this.toolInstance = toolInstance;
        this.formHandlers = new FormHandlers(instanceId, toolInstance);
        this.popupHandlers = new PopupHandlers(instanceId);
    }

    setupEventListeners(container, environmentManager, apiRequestService, codeMirrorManager) {
        this.setupMethodCycling(container);
        this.setupEnvironmentHandlers(container, environmentManager);
        this.setupToggleHandlers(container, codeMirrorManager);
        this.setupTabHandlers(container, codeMirrorManager);
        this.setupFormHandlers(container, apiRequestService);
        this.setupResponseTabHandlers(container);
        this.setupPopupHandlers(environmentManager);
    }

    setupMethodCycling(container) {
        const methods = [
            { name: "GET", class: "text-blue-700 bg-blue-100 border-blue-200" },
            { name: "POST", class: "text-green-700 bg-green-50 border-green-200" },
            { name: "PUT", class: "text-orange-700 bg-orange-50 border-orange-200" },
            { name: "PATCH", class: "text-purple-700 bg-purple-50 border-purple-200" },
            { name: "DELETE", class: "text-red-700 bg-red-50 border-red-200" }
        ];

        let currentMethodIndex = methods.findIndex(m => m.name === this.toolInstance.data.method) || 0;

        const methodBtn = container.querySelector(`#${this.instanceId}-api-method-btn`);
        if (methodBtn) {
            methodBtn.addEventListener('click', () => {
                currentMethodIndex = (currentMethodIndex + 1) % methods.length;
                const method = methods[currentMethodIndex];
                this.toolInstance.data.method = method.name;
                methodBtn.innerHTML = `${method.name}<icon class="fas fa-chevron-down ml-2"></icon>`;
                methodBtn.className = "px-4 py-2 text-sm font-medium rounded-md border cursor-pointer !rounded-button whitespace-nowrap";
                methodBtn.className += " " + method.class;
            });
        }
    }

    setupEnvironmentHandlers(container, environmentManager) {
        const envCogBtn = container.querySelector(`#${this.instanceId}-env-cog-btn`);
        const envDropdown = container.querySelector(`#${this.instanceId}-env-dropdown`);
        const baseUrlInput = container.querySelector(`#${this.instanceId}-base-url-input`);

        if (envCogBtn && envDropdown && baseUrlInput) {
            // Function to update check icon state
            const updateCheckIcon = () => {
                envDropdown.querySelectorAll('button[data-value] icon.fas.fa-check').forEach(icon => {
                    icon.classList.add('hidden');
                });

                if (this.toolInstance.data.envLabel) {
                    const matchingButton = envDropdown.querySelector(`button[data-label="${this.toolInstance.data.envLabel}"]`);
                    if (matchingButton) {
                        const checkIcon = matchingButton.querySelector('icon.fas.fa-check');
                        if (checkIcon) {
                            checkIcon.classList.remove('hidden');
                        }
                    }
                }
            };

            envCogBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                envDropdown.classList.toggle('hidden');
                if (!envDropdown.classList.contains('hidden')) {
                    // Refresh environment options from the database
                    await environmentManager.fetchEnvironmentVariables();

                    // Update the dropdown content with fresh environment options
                    const envDropdownContent = envDropdown.querySelector('.p-2');
                    if (envDropdownContent) {
                        const envOptions = environmentManager.getEnvOptions();
                        envDropdownContent.innerHTML = envOptions.map(env => `
                            <button class="bg-none border-0 w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer flex items-center justify-between" data-value="${env.value}" data-label="${env.label}" data-id="${env?.id || ''}" data-scope="${env.scope || ''}">
                                <div>
                                    <div class="font-medium">${env.label}</div>
                                    <div class="text-xs text-gray-500 truncate">${env.value}</div>
                                </div>
                                <icon class="fas fa-check text-blue-600 hidden"></icon>
                            </button>
                        `).join('');
                    }

                    // Re-attach event listeners to the refreshed dropdown content
                    this.attachEnvironmentEventListeners(envDropdown, baseUrlInput, environmentManager);
                    updateCheckIcon();
                }
            });

            // Hide dropdown on outside click
            document.addEventListener('click', (e) => {
                if (!envDropdown.classList.contains('hidden')) {
                    envDropdown.classList.add('hidden');
                }
            });

            // Add Environment button logic
            const addEnvBtn = container.querySelector(`#${this.instanceId}-add-env-btn`);
            if (addEnvBtn) {
                addEnvBtn.addEventListener('click', () => {
                    const popup = document.querySelector(`#${this.instanceId}-env-popup`);
                    if (popup) {
                        popup.classList.remove('hidden');
                        popup.style.display = 'flex';
                        popup.style.visibility = 'visible';
                        popup.style.opacity = '1';
                    }
                });
            }
        }

        // URL input logic with cURL import support
        const urlInput = container.querySelector(`#${this.instanceId}-base-url-input`);
        if (urlInput) {
            urlInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();

                // Check if the input looks like a cURL command
                if (value.startsWith('curl ')) {
                    this.parseCurlCommand(value, container);
                } else {
                    this.toolInstance.data.url = value;
                }
            });

            // Also handle paste events for cURL commands
            urlInput.addEventListener('paste', (e) => {
                setTimeout(() => {
                    const value = e.target.value.trim();
                    if (value.startsWith('curl ')) {
                        this.parseCurlCommand(value, container);
                    }
                }, 10);
            });
        }
    }

    parseCurlCommand(curlCommand, container) {
        try {

            // Parse the cURL command
            const parsed = this.curlParser(curlCommand);

            if (parsed) {
                // Update the tool data with parsed information
                this.toolInstance.data.method = parsed.method || 'GET';
                this.toolInstance.data.url = parsed.url || '';
                this.toolInstance.data.request.headers = parsed.headers || [];
                this.toolInstance.data.request.cookies = parsed.cookies || [];
                this.toolInstance.data.request.body = parsed.body || '';

                // Update the UI
                this.updateUIFromParsedData(container, parsed);

                console.log('Successfully parsed cURL command:', parsed);
            }
        } catch (error) {
            console.error('Error parsing cURL command:', error);
        }
    }

    curlParser(curlCommand) {
        const result = {
            method: 'GET',
            url: '',
            headers: [],
            cookies: [],
            body: ''
        };

        // Remove 'curl' from the beginning and normalize spaces
        let command = curlCommand.replace(/^curl\s+/, '').trim();

        // Extract method
        const methodMatch = command.match(/-X\s+([A-Z]+)/i);
        if (methodMatch) {
            result.method = methodMatch[1].toUpperCase();
            command = command.replace(/-X\s+[A-Z]+/i, '').trim();
        }

        // Extract headers
        const headerMatches = command.matchAll(/-H\s+['"]([^'"]+)['"]/g);
        for (const match of headerMatches) {
            const headerLine = match[1];
            const colonIndex = headerLine.indexOf(':');
            if (colonIndex > 0) {
                const key = headerLine.substring(0, colonIndex).trim();
                const value = headerLine.substring(colonIndex + 1).trim();

                // Handle cookies separately
                if (key.toLowerCase() === 'cookie') {
                    const cookies = value.split(';').map(cookie => {
                        const [cookieKey, cookieValue] = cookie.split('=').map(s => s.trim());
                        return { key: cookieKey, value: cookieValue || '' };
                    }).filter(cookie => cookie.key);
                    result.cookies.push(...cookies);
                } else {
                    result.headers.push({ key, value });
                }
            }
            command = command.replace(match[0], '').trim();
        }

        // Extract cookies from -b parameter
        const cookieMatches = command.matchAll(/-b\s+['"]([^'"]+)['"]/g);
        for (const match of cookieMatches) {
            const cookieValue = match[1];
            // Handle multiple cookies separated by semicolons
            const cookies = cookieValue.split(';').map(cookie => {
                const [cookieKey, cookieVal] = cookie.split('=').map(s => s.trim());
                return { key: cookieKey, value: cookieVal || '' };
            }).filter(cookie => cookie.key);
            result.cookies.push(...cookies);
            command = command.replace(match[0], '').trim();
        }

        // Extract body data (handle both -d and --data-raw)
        const bodyMatch = command.match(/(?:--data-raw|-d)\s+['"]([^'"]*)['"]/);
        if (bodyMatch) {
            result.body = bodyMatch[1];
            command = command.replace(bodyMatch[0], '').trim();
        }

        // Extract URL (should be what's left)
        const urlMatch = command.match(/['"]?([^'"]+)['"]?/);
        if (urlMatch) {
            result.url = urlMatch[1].replace(/['"]/g, '');
        }

        return result;
    }

    updateUIFromParsedData(container, parsed) {
        // Update method button
        const methodBtn = container.querySelector(`#${this.instanceId}-api-method-btn`);
        if (methodBtn) {
            const methods = [
                { name: "GET", class: "text-blue-700 bg-blue-100 border-blue-200" },
                { name: "POST", class: "text-green-700 bg-green-50 border-green-200" },
                { name: "PUT", class: "text-orange-700 bg-orange-50 border-orange-200" },
                { name: "PATCH", class: "text-purple-700 bg-purple-50 border-purple-200" },
                { name: "DELETE", class: "text-red-700 bg-red-50 border-red-200" }
            ];
            const method = methods.find(m => m.name === parsed.method) || methods[0];
            methodBtn.innerHTML = `${method.name}<icon class="fas fa-chevron-down ml-2"></icon>`;
            methodBtn.className = "px-4 py-2 text-sm font-medium rounded-md border cursor-pointer !rounded-button whitespace-nowrap " + method.class;
        }

        // Update URL input
        const urlInput = container.querySelector(`#${this.instanceId}-base-url-input`);
        if (urlInput) {
            urlInput.value = parsed.url;
        }

        // Refresh form handlers to update headers and cookies lists
        setTimeout(() => {
            this.formHandlers.refreshAllLists(container);
        }, 100);
    }

    attachEnvironmentEventListeners(envDropdown, baseUrlInput, environmentManager) {
        if (envDropdown) {
            envDropdown.querySelectorAll('button[data-value]').forEach(option => {
                option.addEventListener('click', (e) => {
                    const value = option.getAttribute('data-value');
                    const label = option.getAttribute('data-label');

                    // Hide all check icons first
                    envDropdown.querySelectorAll('button[data-value] icon.fas.fa-check').forEach(icon => {
                        icon.classList.add('hidden');
                    });

                    // Show check icon for selected option
                    const checkIcon = option.querySelector('icon.fas.fa-check');
                    if (checkIcon) {
                        checkIcon.classList.remove('hidden');
                    }

                    // Extract path from current URL
                    const rest = environmentManager.extractPathFromUrl(this.toolInstance.data.url, value);

                    this.toolInstance.data.url = value + rest;
                    this.toolInstance.data.envLabel = label;
                    if (baseUrlInput) {
                        baseUrlInput.value = this.toolInstance.data.url;
                    }
                    envDropdown.classList.add('hidden');
                });
            });
        }
    }

    setupToggleHandlers(container, codeMirrorManager) {
        const toggleBtn = container.querySelector(`#${this.instanceId}-toggle-section-btn`);
        const toggleSection = container.querySelector(`#${this.instanceId}-toggle-section`);
        const toggleChevron = container.querySelector(`#${this.instanceId}-toggle-chevron`);

        if (toggleBtn && toggleSection && toggleChevron) {
            toggleBtn.addEventListener('click', () => {
                const isOpen = !toggleSection.classList.contains('hidden');
                if (isOpen) {
                    toggleSection.classList.add('hidden');
                    toggleChevron.classList.remove('fa-chevron-up');
                    toggleChevron.classList.add('fa-chevron-down');
                } else {
                    toggleSection.classList.remove('hidden');
                    toggleChevron.classList.remove('fa-chevron-down');
                    toggleChevron.classList.add('fa-chevron-up');
                }

                // Initialize response editor when section is opened
                if (!isOpen) {
                    setTimeout(() => {
                        codeMirrorManager.initializeResponseEditor(this.toolInstance);
                    }, 100);
                }
            });
        }
    }

    setupTabHandlers(container, codeMirrorManager) {
        const tabIds = ['params', 'query', 'auth', 'headers', 'cookies', 'body'];

        tabIds.forEach(id => {
            const tabBtn = container.querySelector(`#${this.instanceId}-tab-${id}`);
            if (tabBtn) {
                tabBtn.addEventListener('click', () => {
                    tabIds.forEach(otherId => {
                        const section = container.querySelector(`#${this.instanceId}-section-${otherId}`);
                        const otherTabBtn = container.querySelector(`#${this.instanceId}-tab-${otherId}`);

                        if (section) {
                            section.classList.toggle('hidden', otherId !== id);
                        }

                        if (otherTabBtn) {
                            if (otherId === id) {
                                otherTabBtn.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
                                otherTabBtn.classList.remove('border-transparent', 'text-gray-500');
                            } else {
                                otherTabBtn.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600');
                                otherTabBtn.classList.add('border-transparent', 'text-gray-500');
                            }
                        }
                    });

                    // Initialize request editor when body tab is clicked
                    if (id === 'body') {
                        setTimeout(() => {
                            const editor = codeMirrorManager.initializeRequestEditor();
                            if (editor) {
                                editor.on('change', () => {
                                    this.toolInstance.data.request.body = editor.getValue();
                                });
                            }
                        }, 100);
                    }

                    // Initialize authorization headers when auth tab is clicked
                    if (id === 'auth') {
                        setTimeout(() => {
                            this.formHandlers.updateAuthorizationHeaders();
                        }, 100);
                    }
                });
            }
        });
    }

    setupFormHandlers(container, apiRequestService) {
        this.formHandlers.setupFormHandlers(container, apiRequestService);
    }

    setupResponseTabHandlers(container) {
        const responseTabBody = container.querySelector(`#${this.instanceId}-response-tab-body`);
        const responseTabHeaders = container.querySelector(`#${this.instanceId}-response-tab-headers`);
        const responseBodySection = container.querySelector(`#${this.instanceId}-response-body-section`);
        const responseHeadersSection = container.querySelector(`#${this.instanceId}-response-headers-section`);

        if (responseTabBody && responseTabHeaders && responseBodySection && responseHeadersSection) {
            responseTabBody.addEventListener('click', () => {
                responseTabBody.classList.add('bg-gray-new-50', 'text-blue-600');
                responseTabBody.classList.remove('text-gray-500', 'bg-white');
                responseTabHeaders.classList.remove('bg-gray-new-50', 'text-blue-600');
                responseTabHeaders.classList.add('text-gray-500', 'bg-white');
                responseBodySection.classList.remove('hidden');
                responseHeadersSection.classList.add('hidden');
            });

            responseTabHeaders.addEventListener('click', () => {
                responseTabHeaders.classList.add('bg-gray-new-50', 'text-blue-600');
                responseTabHeaders.classList.remove('text-gray-500', 'bg-white');
                responseTabBody.classList.remove('bg-gray-new-50', 'text-blue-600');
                responseTabBody.classList.add('text-gray-500', 'bg-white');
                responseBodySection.classList.add('hidden');
                responseHeadersSection.classList.remove('hidden');
            });
        }
    }

    setupPopupHandlers(environmentManager) {
        this.popupHandlers.setupPopupEventListeners(environmentManager);
    }
}
