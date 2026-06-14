export class CodeMirrorManager {
    constructor(instanceId) {
        this.instanceId = instanceId;
        this.responseEditor = null;
        this.requestEditor = null;
    }

    initializeResponseEditor(toolInstance = null) {
        const responseTextarea = document.querySelector(`#${this.instanceId}-body-editor`);
        const responseContainer = document.querySelector(`#${this.instanceId}-body-editor-container`);

        if (!responseTextarea || !responseContainer) {
            return;
        }

        // Destroy previous instance if exists
        if (this.responseEditor) {
            this.responseEditor.toTextArea();
            this.responseEditor = null;
        }

        // Clear container before appending
        responseContainer.innerHTML = '';

        this.responseEditor = window.CodeMirror.fromTextArea(responseTextarea, {
            mode: { name: "javascript", json: true },
            theme: "eclipse",
            lineNumbers: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            matchBrackets: true,
            autoCloseBrackets: true,
            lineWrapping: true,
            readOnly: false,
            extraKeys: {
                "Ctrl-/": "toggleComment",
                "Cmd-/": "toggleComment", // macOS
            },
        });

        responseContainer.appendChild(this.responseEditor.getWrapperElement());

        // Prevent Editor.js or global key interference
        this.responseEditor.getWrapperElement().addEventListener("keydown", e => e.stopPropagation());

        // Add change event listener to save manual edits
        if (toolInstance) {
            this.responseEditor.on('change', () => {
                try {
                    const content = this.responseEditor.getValue();
                    if (content.trim()) {
                        // Try to parse as JSON, if it fails, store as plain text
                        let parsedContent;
                        try {
                            parsedContent = JSON.parse(content);
                        } catch (e) {
                            parsedContent = content;
                        }

                        // Update the tool's response data
                        if (!toolInstance.data.response) {
                            toolInstance.data.response = {};
                        }
                        console.log('Saving response editor changes:', parsedContent);
                        toolInstance.data.response.body = parsedContent;
                    }
                } catch (error) {
                    console.error('Error saving response editor changes:', error);
                }
            });
        }

        // Force refresh to ensure proper rendering
        setTimeout(() => {
            if (this.responseEditor) {
                this.responseEditor.refresh();
            }
        }, 50);
    }

    initializeRequestEditor() {
        const reqBodyTextarea = document.querySelector(`#${this.instanceId}-req-body-editor`);
        const reqBodyContainer = document.querySelector(`#${this.instanceId}-req-body-editor-container`);

        if (!reqBodyTextarea || !reqBodyContainer) {
            return;
        }

        // Only initialize if not already present
        if (!this.requestEditor) {
            // Destroy previous instance if exists (defensive)
            if (this.requestEditor) {
                this.requestEditor.toTextArea();
                this.requestEditor = null;
            }

            // Clear container before appending
            reqBodyContainer.innerHTML = '';

            this.requestEditor = window.CodeMirror.fromTextArea(reqBodyTextarea, {
                mode: { name: "javascript", json: true },
                theme: "eclipse",
                lineNumbers: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                matchBrackets: true,
                autoCloseBrackets: true,
            });

            reqBodyContainer.appendChild(this.requestEditor.getWrapperElement());

            // Prevent Editor.js or global key interference
            this.requestEditor.getWrapperElement().addEventListener("keydown", e => e.stopPropagation());

            // Return the editor for further configuration
            return this.requestEditor;
        }
    }

    getResponseEditor() {
        return this.responseEditor;
    }

    getRequestEditor() {
        return this.requestEditor;
    }

    updateResponseContent(content) {
        if (this.responseEditor) {
            const newBody = content
                ? JSON.stringify(content, null, 2)
                : 'No response data available';
            this.responseEditor.setValue(newBody);
        }
    }

    destroyEditors() {
        if (this.responseEditor) {
            this.responseEditor.toTextArea();
            this.responseEditor = null;
        }
        if (this.requestEditor) {
            this.requestEditor.toTextArea();
            this.requestEditor = null;
        }
    }
}
