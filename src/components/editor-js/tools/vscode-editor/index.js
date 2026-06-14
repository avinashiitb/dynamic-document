import * as monaco from 'monaco-editor';

// Place this before you create the Monaco editor instance
window.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        // This will inline the worker as a blob, which works in Electron
        return URL.createObjectURL(
            new Blob(
                [
                    `
          self.MonacoEnvironment = { baseUrl: '${window.location.origin}' };
          importScripts('${window.location.origin}/monaco-editor/min/vs/base/worker/workerMain.js');
        `,
                ],
                { type: 'text/javascript' }
            )
        );
    }
};

export default class MonacoCodeBlock {
    static get toolbox() {
        return {
            title: 'Code',
            icon: '<svg viewBox="0 0 24 24"><path d="M8 9l-5 3 5 3V9zm8 6l5-3-5-3v6z"/></svg>',
        };
    }

    constructor({ data }) {
        this.data = data || {
            code: '',
            language: 'javascript',
            theme: 'vs-dark',
        };

        this.wrapper = null;
        this.editor = null;
        this.languageSelector = null;
        this.themeSelector = null;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.style = 'border: 1px solid #ddd; padding: 10px;';

        const controls = document.createElement('div');
        controls.style = 'margin-bottom: 5px; display: flex; gap: 10px; align-items: center;';

        // Language selector
        this.languageSelector = document.createElement('select');
        const languages = ['javascript', 'typescript', 'json', 'shell', 'html', 'css'];
        languages.forEach((lang) => {
            const option = document.createElement('option');
            option.value = lang;
            option.innerText = lang;
            if (lang === this.data.language) option.selected = true;
            this.languageSelector.appendChild(option);
        });

        // Theme selector
        this.themeSelector = document.createElement('select');
        const themes = ['vs-dark', 'vs-light', 'hc-black'];
        themes.forEach((theme) => {
            const option = document.createElement('option');
            option.value = theme;
            option.innerText = theme;
            if (theme === this.data.theme) option.selected = true;
            this.themeSelector.appendChild(option);
        });

        controls.appendChild(this._label('Language:'));
        controls.appendChild(this.languageSelector);
        controls.appendChild(this._label('Theme:'));
        controls.appendChild(this.themeSelector);

        const editorContainer = document.createElement('div');
        editorContainer.style = 'height: 300px; border: 1px solid #ccc;';
        editorContainer.id = `monaco-${Math.random().toString(36).substring(2)}`;

        this.wrapper.appendChild(controls);
        this.wrapper.appendChild(editorContainer);

        setTimeout(() => {
            this.editor = monaco.editor.create(editorContainer, {
                value: this.data.code || '',
                language: this.data.language,
                theme: this.data.theme,
                automaticLayout: true,
            });

            this.languageSelector.addEventListener('change', () => {
                const newLang = this.languageSelector.value;
                monaco.editor.setModelLanguage(this.editor.getModel(), newLang);
            });

            this.themeSelector.addEventListener('change', () => {
                const newTheme = this.themeSelector.value;
                monaco.editor.setTheme(newTheme);
            });
        }, 0);

        return this.wrapper;
    }

    _label(text) {
        const label = document.createElement('span');
        label.textContent = text;
        label.style = 'font-size: 14px;';
        return label;
    }

    save(blockContent) {
        return {
            code: this.editor ? this.editor.getValue() : '',
            language: this.languageSelector?.value || 'javascript',
            theme: this.themeSelector?.value || 'vs-dark',
        };
    }

    destroy() {
        if (this.editor) this.editor.dispose();
    }

    static get isReadOnlySupported() {
        return true;
    }
}
