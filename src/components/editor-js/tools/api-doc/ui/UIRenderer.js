import { UITemplates } from './UITemplates.js';

export class UIRenderer {
    constructor(instanceId) {
        this.instanceId = instanceId;
        this.templates = new UITemplates(instanceId);
    }

    render(container, data, envOptions) {
        container.className = 'bg-white rounded-lg border border-gray-200 overflow-hidden mt-2';

        const methods = [
            { name: "GET", class: "text-blue-700 bg-blue-100 border-blue-200" },
            { name: "POST", class: "text-green-700 bg-green-50 border-green-200" },
            { name: "PUT", class: "text-orange-700 bg-orange-50 border-orange-200" },
            { name: "PATCH", class: "text-purple-700 bg-purple-50 border-purple-200" },
            { name: "DELETE", class: "text-red-700 bg-red-50 border-red-200" }
        ];

        const currentMethodIndex = methods.findIndex(m => m.name === data.method) || 0;

        // Render main UI
        container.innerHTML = this.templates.getMainTemplate(data, envOptions, methods, currentMethodIndex);

        // Add popup to document body
        const popupHTML = this.templates.getPopupTemplate();
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    updateResponseUI(responseData, responseEditor) {
        // Update status and timing display
        const statusElements = document.querySelectorAll('.text-sm.text-gray-600');
        const timeElements = document.querySelectorAll('.text-sm.text-gray-600');

        statusElements.forEach(element => {
            if (element.textContent.includes('Status:')) {
                element.textContent = `Status: ${responseData.status || '-'}`;
            }
        });

        timeElements.forEach(element => {
            if (element.textContent.includes('ms')) {
                element.textContent = `${responseData.timeTaken || '-'}ms`;
            }
        });

        if (responseEditor) {
            const newBody = responseData.body
                ? JSON.stringify(responseData.body, null, 2)
                : 'No response data available';
            responseEditor.setValue(newBody);
        }

        // Update response headers
        const responseHeadersElement = document.querySelector(`#${this.instanceId}-response-headers-section pre`);
        if (responseHeadersElement) {
            responseHeadersElement.textContent = Object.keys(responseData.headers).length > 0 ?
                JSON.stringify(responseData.headers, null, 2) :
                'No headers available';
        }
    }
}
