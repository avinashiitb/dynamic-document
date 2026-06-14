import './code-block.css';
import 'codemirror/lib/codemirror.css';
import { IconBrackets } from '@codexteam/icons';
import CodeMirror from 'codemirror';

// Import modes for syntax highlighting
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/php/php';
import 'codemirror/mode/go/go';
import 'codemirror/mode/rust/rust';
import 'codemirror/mode/swift/swift';
import 'codemirror/mode/clike/clike'; // For Java, C++, C#

// Import folding addons
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/indent-fold';

// Import bracket matching and auto-closing
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';

// Import folding gutter CSS
import 'codemirror/addon/fold/foldgutter.css';
import "codemirror/addon/comment/comment";
import { getCodeBlockPasteConfig, processCodePaste } from '../../../../utils/editorPasteUtils';

export default class RawTool {
    static get toolbox() {
        return {
            title: 'Code Block',
            icon: IconBrackets
        };
    }

    static get enableLineBreaks() {
        return true;
    }

    static get isReadOnlySupported() {
        return true;
    }

    static get pasteConfig() {
        return getCodeBlockPasteConfig();
    }

    onPaste(event) {
        const text = processCodePaste(event);

        if (text) {
            this.data = { html: text };

            if (this.codeMirror) {
                this.codeMirror.setValue(text);
                setTimeout(() => this.codeMirror.refresh(), 0);
            }
        }
    }

    static get sanitize() {
        return { html: true };
    }

    static get conversionConfig() {
        return {
            export: 'html',
            import: 'html'
        };
    }

    constructor({ data, config, api, readOnly }) {
        this.api = api;
        this.readOnly = readOnly;

        this.data = {
            html: data.html || ''
        };

        this.placeholder = api.i18n.t(config.placeholder || 'Enter your code...');
        this.codeMirror = null;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('ce-rawtool');

        // Inject scoped CodeMirror CSS
        const style = document.createElement('style');
        style.textContent = `
            .ce-rawtool .CodeMirror {
                border-radius: 0.375rem; /* Tailwind's rounded-lg */
                border: 1px solid #e5e7eb;
                min-height: 34px;
                margin-top: 0.75rem;
                margin-bottom: 0.75rem;
            }

            .ce-rawtool .CodeMirror-sizer {
                padding-top: 5px;
                padding-bottom: 3px !important;
            }
        `;

        this.wrapper.appendChild(style);

        // Required fake editable div for Editor.js
        const fakeEditable = document.createElement('div');
        fakeEditable.contentEditable = true;
        fakeEditable.classList.add('ce-rawtool__fake-editable');
        fakeEditable.style.position = 'absolute';
        fakeEditable.style.left = '-9999px';
        this.wrapper.appendChild(fakeEditable);

        const textarea = document.createElement('textarea');
        this.wrapper.appendChild(textarea);

        this.codeMirror = CodeMirror.fromTextArea(textarea, {
            mode: 'javascript',
            theme: 'default',
            lineNumbers: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            matchBrackets: true,
            autoCloseBrackets: true,
            lineWrapping: true,
            readOnly: this.readOnly,
            placeholder: this.placeholder,
            extraKeys: {
                "Ctrl-/": "toggleComment",
                "Cmd-/": "toggleComment", // macOS
            },
        });

        // Prevent Editor.js from hijacking keyboard events (arrow keys, tab, enter, etc.)
        this.codeMirror.getWrapperElement().addEventListener("keydown", (e) => {
            e.stopPropagation();
        });

        if (this.data.html) {
            this.codeMirror.setValue(this.data.html);
        }

        if (!this.readOnly) {
            this.codeMirror.on('change', () => {
                this.data.html = this.codeMirror.getValue();
            });
        }

        setTimeout(() => this.codeMirror.refresh(), 0);

        return this.wrapper;
    }


    save() {
        return {
            html: this.codeMirror ? this.codeMirror.getValue() : this.data.html
        };
    }

    destroy() {
        if (this.codeMirror) {
            this.codeMirror.toTextArea();
            this.codeMirror = null;
        }
    }
}
