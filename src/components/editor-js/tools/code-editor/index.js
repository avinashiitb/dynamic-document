import "./code-editor.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";

// Core CodeMirror
import CodeMirror from 'codemirror';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/clike/clike'; // For Java
import 'codemirror/mode/python/python'; // if needed

// Folding Addons
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold'; // Optional for multiline comment folding

import "codemirror/addon/comment/comment";

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/sql-hint'; // optional
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/addon/hint/show-hint.css';

import 'codemirror/addon/edit/closebrackets';


// Folding Gutter CSS
import 'codemirror/addon/fold/foldgutter.css';

const ipcRenderer = {
  invoke: (channel, ...args) => window.pluginAPI.messaging.invoke(channel, ...args)
};

export class JSCodeTool {
  static get toolbox() {
    return {
      title: "Code Editor",
      icon: `
        <svg width="17" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.5 15L17.5 12L14.5 9M9.5 9L6.5 12L9.5 15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
    };
  }

  static get conversionConfig() {
    return {
      export: (data) => data.code,
      import: (content) => ({
        code: content,
        language: 'javascript'
      })
    };
  }

  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.data = data;
    this.readOnly = readOnly;
    this.wrapper = null;
    this.editor = null;
    this.outputFrame = null;
    this.outputContainer = null;
    this.resizeHandler = null;
    this.selectedLang = data?.language || "javascript"; // Restore saved language or default to javascript
    this.outputViewMode = 'raw'; // 'raw' or 'table'
    this.lastOutput = null; // Store last output for toggling
  }


  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add(
      "simple-js-editor",
      "bg-gray-50",
      "rounded-lg",
      "shadow-sm",
      "border",
      "border-gray-200",
    );

    this.wrapper.contentEditable = "true";
    this._createEditor(this.data ? this.data.code : "");

    return this.wrapper;
  }

  _createEditor(code) {
    const container = document.createElement("div");
    container.classList.add("code-editor-container");

    const editorHeader = document.createElement("div");
    editorHeader.classList.add(
      "editor-header",
      "bg-gray-50",
      "text-white",
      "px-4",
      "py-3",
      "flex",
      "items-center",
      "justify-between",
      "border-b",
      "border-gray-200",
      "border-slate-700/50"
    );

    const left = document.createElement("div");
    left.classList.add("flex", "items-center");

    const dropdownWrapper = document.createElement("div");
    dropdownWrapper.className = "relative";

    // Selected language (shown in button)
    const langButton = document.createElement("button");
    langButton.className = "bg-slate-800 border-slate-600 border hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 !rounded-button whitespace-nowrap";
    langButton.style.setProperty("border-color", "#475569", "important");
    langButton.innerHTML = `
        <i class="fa-solid fa-code text-yellow-400"></i>
        <span class="selected-lang">JavaScript</span>
        <i class="fas fa-chevron-down ml-2 text-slate-400 text-xs"></i>
    `;

    // Language options (dropdown menu)
    const langMenu = document.createElement("ul");
    langMenu.className = "absolute w-48 z-10 mt-1 bg-slate-800 text-white rounded-md shadow-lg text-sm hidden border border-slate-600";
    langMenu.style.setProperty("border-color", "#475569", "important");
    langMenu.innerHTML = `
      <li class="cursor-pointer hover:bg-slate-700 px-4 py-2 flex items-center space-x-2" data-lang="javascript">
        <i class="fa-brands fa-js text-yellow-400"></i>
        <span>JavaScript</span>
      </li>
      <li class="cursor-pointer hover:bg-slate-700 px-4 py-2 flex items-center space-x-2" data-lang="typescript">
        <svg class="w-4" viewBox="0 0 400 400" id="Layer_1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><style>.st0{fill:#007acc}.st1{fill:#fff}</style><path class="st0" d="M0 200V0h400v400H0"></path><path class="st1" d="M87.7 200.7V217h52v148h36.9V217h52v-16c0-9 0-16.3-.4-16.5 0-.3-31.7-.4-70.2-.4l-70 .3v16.4l-.3-.1zM321.4 184c10.2 2.4 18 7 25 14.3 3.7 4 9.2 11 9.6 12.8 0 .6-17.3 12.3-27.8 18.8-.4.3-2-1.4-3.6-4-5.2-7.4-10.5-10.6-18.8-11.2-12-.8-20 5.5-20 16 0 3.2.6 5 1.8 7.6 2.7 5.5 7.7 8.8 23.2 15.6 28.6 12.3 41 20.4 48.5 32 8.5 13 10.4 33.4 4.7 48.7-6.4 16.7-22 28-44.3 31.7-7 1.2-23 1-30.5-.3-16-3-31.3-11-40.7-21.3-3.7-4-10.8-14.7-10.4-15.4l3.8-2.4 15-8.7 11.3-6.6 2.6 3.5c3.3 5.2 10.7 12.2 15 14.6 13 6.7 30.4 5.8 39-2 3.7-3.4 5.3-7 5.3-12 0-4.6-.7-6.7-3-10.2-3.2-4.4-9.6-8-27.6-16-20.7-8.8-29.5-14.4-37.7-23-4.7-5.2-9-13.3-11-20-1.5-5.8-2-20-.6-25.7 4.3-20 19.4-34 41-38 7-1.4 23.5-.8 30.4 1l-.2.2z"></path></g></svg>
        <span>TypeScript</span>
      </li>
      <li class="cursor-pointer hover:bg-slate-700 px-4 py-2 flex items-center space-x-2" data-lang="shell">
        <i class="fa-solid fa-terminal text-green-400"></i>
        <span>Shell</span>
      </li>
      <li class="cursor-pointer hover:bg-slate-700 px-4 py-2 flex items-center space-x-2" data-lang="sqlite">
        <i class="fa-solid fa-database text-red-400"></i>
        <span>SQLite</span>
      </li>
      <li class="cursor-pointer hover:bg-slate-700 px-4 py-2 flex items-center space-x-2" data-lang="sql">
        <i class="fa-solid fa-database text-red-400"></i>
        <span>SQL</span>
      </li>
      <li class="cursor-pointer hover:bg-slate-700 px-4 py-2 flex items-center space-x-2" data-lang="java">
        <i class="fa-brands fa-java text-yellow-400"></i>
        <span>JAVA</span>
      </li>
      <li class="cursor-pointer hover:bg-slate-700 px-4 py-2 flex items-center space-x-2" data-lang="java">
        <svg class="w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 21C7.89543 21 7 20.1046 7 19V15.3255C7 14.8363 7 14.5917 6.94474 14.3615C6.89575 14.1575 6.81494 13.9624 6.70528 13.7834C6.5816 13.5816 6.40863 13.4086 6.06274 13.0627L5 12L6.06274 10.9373C6.40864 10.5914 6.5816 10.4184 6.70528 10.2166C6.81494 10.0376 6.89575 9.84254 6.94474 9.63846C7 9.40829 7 9.1637 7 8.67452V5C7 3.89543 7.89543 3 9 3M15 21C16.1046 21 17 20.1046 17 19V15.3255C17 14.8363 17 14.5917 17.0553 14.3615C17.1043 14.1575 17.1851 13.9624 17.2947 13.7834C17.4184 13.5816 17.5914 13.4086 17.9373 13.0627L19 12L17.9373 10.9373C17.5914 10.5914 17.4184 10.4184 17.2947 10.2166C17.1851 10.0376 17.1043 9.84254 17.0553 9.63846C17 9.40829 17 9.1637 17 8.67452V5C17 3.89543 16.1046 3 15 3" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        <span>JSON</span>
      </li>
    `;

    langButton.addEventListener("click", (e) => {
      e.stopPropagation();
      langMenu.classList.toggle("hidden");
    });

    langMenu.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      const selected = li.dataset.lang;
      const label = li.querySelector("span")?.textContent?.trim() || selected;
      const icon = li.querySelector("i, svg")?.outerHTML || "";

      const selectedLangSpan = langButton.querySelector(".selected-lang");
      const iconContainer = langButton.querySelector("i, svg");

      // Replace label
      selectedLangSpan.textContent = label;

      // Replace icon (clear existing and insert new)
      if (iconContainer) iconContainer.remove();
      const newIcon = document.createElement("span");
      newIcon.innerHTML = icon;
      langButton.insertBefore(newIcon.firstChild, selectedLangSpan);

      langMenu.classList.add("hidden");

      // Save selection
      this.selectedLang = selected;

      // Update CodeMirror mode if needed
      if (this.editor) {
        const mode =
          selected === "typescript"
            ? "text/typescript"
            : selected === "javascript"
              ? "javascript"
              : selected === "shell"
                ? "shell"
                : selected === "sqlite"
                  ? "sql"
                  : selected === "sql"
                    ? "sql"
                    : selected === "java"
                      ? "text/x-java"
                      : selected === "json"
                        ? "application/json"
                        : "javascript";

        this.editor.setOption("mode", mode);
      }
    });



    document.addEventListener("click", () => langMenu.classList.add("hidden"));

    dropdownWrapper.appendChild(langButton);
    dropdownWrapper.appendChild(langMenu);
    left.appendChild(dropdownWrapper);

    editorHeader.appendChild(left);
    editorHeader.contentEditable = "false";

    // RIGHT SIDE (Run + Copy + traffic dots)
    const right = document.createElement("div");
    right.classList.add("flex", "items-center");

    // Run Button
    const runButton = document.createElement("button");
    runButton.classList.add(
      "bg-gray-500",
      "hover:bg-blue-700",
      "text-white",
      "px-3",
      "py-1",
      "rounded",
      "text-sm",
      "mr-3",
      "border-0",
      "!rounded-button",
      "whitespace-nowrap",
      "cursor-pointer"
    );
    runButton.innerHTML = `
    <span class="mr-1" style="display: inline-flex; position: relative; top: 0px; align-items: center; justify-content: center; width: 16px; height: 16px; vertical-align: middle;">
      <svg fill="white" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 600 600" enable-background="new 0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M464.7,221.5L86.1,7.3C52.5-11.7,25,7.5,25,50v412c0,42.5,27.5,61.7,61.1,42.7l378.6-214.1 C498.2,271.5,498.2,240.5,464.7,221.5z"></path> </g></svg>
    </span> Run
  `;



    runButton.contentEditable = "false";
    runButton.addEventListener("click", () => this._runCode());

    // Copy Button
    const copyButton = document.createElement("button");
    copyButton.classList.add(
      "bg-gray-500",
      "hover:bg-gray-600",
      "text-white",
      "px-3",
      "py-1",
      "rounded",
      "text-sm",
      "border-0",
      "!rounded-button",
      "whitespace-nowrap",
      "cursor-pointer"
    );
    copyButton.innerHTML = `
      <span class="mr-1" style="display: inline-flex; position: relative; top: 3px; width: 16px; height: 16px;">
        <svg width="256px" height="256px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z" fill="#ffffff"></path> <path d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z" fill="#ffffff"></path> </g></svg>
      </span> Copy
    `;
    copyButton.contentEditable = "false";
    copyButton.addEventListener("click", () => this._copyCode(copyButton));

    // Format Button
    const formatButton = document.createElement("button");
    formatButton.classList.add(
      "bg-gray-500",
      "hover:bg-green-600",
      "text-white",
      "px-3",
      "py-1",
      "rounded",
      "text-sm",
      "mr-3",
      "border-0",
      "!rounded-button",
      "whitespace-nowrap",
      "cursor-pointer"
    );
    formatButton.innerHTML = `
  <span class="mr-1" style="display: inline-flex; position: relative; top: 1px; width: 16px; height: 16px;">
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H15V18H3V16Z"/></svg>
  </span> Format
`;
    formatButton.contentEditable = "false";
    formatButton.addEventListener("click", () => this._formatCode());

    right.appendChild(formatButton);
    right.appendChild(runButton);
    right.appendChild(copyButton);

    // Final assembly
    editorHeader.appendChild(left);
    editorHeader.appendChild(right);
    this.wrapper.appendChild(editorHeader);

    const textarea = document.createElement("textarea");
    this.wrapper.appendChild(textarea);

    this.outputContainer = document.createElement("div");
    this.outputContainer.classList.add("output-container", "bg-[#161b22]", "p-5", "display-none");

    // Ensure CodeMirror is available
    if (typeof CodeMirror !== "undefined") {
      this.editor = CodeMirror.fromTextArea(textarea, {
        mode: "javascript",
        theme: "dracula",
        lineNumbers: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        matchBrackets: true,
        autoCloseBrackets: true,
        extraKeys: {
          "Ctrl-/": "toggleComment",
          "Cmd-/": "toggleComment", // macOS
        },
      });

      this.editor.getWrapperElement().addEventListener("keydown", (e) => {
        e.stopPropagation(); // prevents Editor.js from hijacking Tab, Enter, etc.
      });


      if (typeof code === "string") {
        this.editor.setValue(code);
      } else {
        console.error("Code data is not a string:", code);
      }

      // Force a redraw to ensure the content is visible
      setTimeout(() => {
        this.editor.refresh();
        this.editor.focus(); // Focus the editor after it is created
      }, 0);



      this.editor.on("inputRead", (cm, change) => {
        if (
          change.origin !== 'setValue' &&
          change.text[0] &&
          /[a-zA-Z0-9_.]/.test(change.text[0])
        ) {
          CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
        }
      });
    } else {
      console.error("CodeMirror is not defined.");
      return;
    }

    const terminalHeader = document.createElement("div");
    terminalHeader.classList.add("terminal-header", "flex", "items-center", "text-sm", "text-slate-300", "mb-3");
    terminalHeader.innerHTML = `
          <span class="terminal-icon text-blue-600">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#6b1cff" stroke-width="0.41600000000000004"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="#6b1cff"> <path d="M3.23 3.174a.75.75 0 00-.96 1.152L6.078 7.5 2.27 10.674a.75.75 0 10.96 1.152l4.5-3.75a.75.75 0 000-1.152l-4.5-3.75zM7.75 12a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z"></path> </g> </g></svg>
          </span>
          <span class="font-medium text-slate-300"> Console Output:</span>
    `;
    // Table view toggle button
    const tableToggleBtn = document.createElement('button');
    tableToggleBtn.className = 'bg-gray-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm mr-3 border-0 !rounded-button whitespace-nowrap cursor-pointer';
    tableToggleBtn.title = this.outputViewMode === 'table' ? 'Show Raw Output' : 'Show Table Output';
    tableToggleBtn.innerHTML = this.outputViewMode === 'table'
      ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`
      : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`;
    tableToggleBtn.style.marginLeft = 'auto';
    tableToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.outputViewMode = this.outputViewMode === 'table' ? 'raw' : 'table';
      this._showOutput(this.lastOutput, this.lastIsError);
    });
    terminalHeader.appendChild(tableToggleBtn);
    this.outputContainer.appendChild(terminalHeader);

    this.outputFrame = document.createElement("div");
    // this.outputFrame.style.height = "0px";
    this.outputFrame.classList.add(
      "terminal-output",
      "border",
      "border-slate-700/50",
      "rounded-lg",
      "p-4",
      "font-mono",
      "text-sm",
      "text-emerald-400",
      "shadow-inner",
    );

    this.outputContainer.appendChild(this.outputFrame);

    this.wrapper.appendChild(container);
    this.wrapper.appendChild(this.outputContainer);

    // Restore saved language in UI and CodeMirror mode
    this._restoreSavedLanguage(langButton, langMenu);
  }

  _restoreSavedLanguage(langButton, langMenu) {
    // Find the menu item that matches the saved language
    const savedLangItem = langMenu.querySelector(`[data-lang="${this.selectedLang}"]`);

    if (savedLangItem) {
      const label = savedLangItem.querySelector("span")?.textContent?.trim() || this.selectedLang;
      const icon = savedLangItem.querySelector("i, svg")?.outerHTML || "";

      const selectedLangSpan = langButton.querySelector(".selected-lang");
      const iconContainer = langButton.querySelector("i, svg");

      // Update the button to show the saved language
      selectedLangSpan.textContent = label;

      // Replace icon (clear existing and insert new)
      if (iconContainer) iconContainer.remove();
      const newIcon = document.createElement("span");
      newIcon.innerHTML = icon;
      langButton.insertBefore(newIcon.firstChild, selectedLangSpan);

      // Set the correct CodeMirror mode for the saved language
      if (this.editor) {
        const mode =
          this.selectedLang === "typescript"
            ? "text/typescript"
            : this.selectedLang === "javascript"
              ? "javascript"
              : this.selectedLang === "shell"
                ? "shell"
                : this.selectedLang === "sqlite"
                  ? "sql"
                  : this.selectedLang === "sql"
                    ? "sql"
                    : this.selectedLang === "java"
                      ? "text/x-java"
                      : this.selectedLang === "json"
                        ? "application/json"
                        : "javascript";

        this.editor.setOption("mode", mode);
      }
    }
  }

  // _adjustHeight(container, outputContainer) {
  //   const editorHeight = this.editor.getScrollInfo().height;
  //   // this.outputContainer.style.height = Math.min(650, Math.max(650, editorHeight + 20)) + "px";
  //   // Set a min height of 100px and max of 650px
  //   const newHeight = Math.max(100, Math.min(650, editorHeight + 20));
  //   this.outputContainer.style.height = newHeight + "px";
  // }

  _formatCode() {
    const code = this.editor.getValue();
    let formatted = code;

    try {
      if (this.selectedLang === "json") {
        const parsed = JSON.parse(code);
        formatted = JSON.stringify(parsed, null, 2); // Pretty-print with 2-space indent
      } else {
        // fallback to JS formatter
        formatted = this._basicIndentFormat(code);
      }

      const cursor = this.editor.getCursor();
      this.editor.setValue(formatted);
      this.editor.setCursor(cursor);
    } catch (error) {
      console.error("Error formatting code:", error);
      alert("Error formatting code: " + error.message);
    }
  }


  _basicIndentFormat(code) {
    const lines = code.split('\n');
    const indentSize = 4;
    let indentLevel = 0;

    return lines.map(line => {
      const trimmed = line.trim();

      // Decrease indent if line starts with closing brace
      if (trimmed.startsWith('}') || trimmed.startsWith('];')) {
        indentLevel = Math.max(indentLevel - 1, 0);
      }

      const formattedLine = ' '.repeat(indentSize * indentLevel) + trimmed;

      // Increase indent if line ends with opening brace
      if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
        indentLevel++;
      }

      return formattedLine;
    }).join('\n');
  }

  _runCode() {
    const code = this.editor.getValue();
    const lang = this.selectedLang; // using your dropdown's state

    this.outputContainer.classList.remove("display-none");

    if (lang === "javascript") {
      ipcRenderer.invoke("run-js-code", code)
        .then(output => {
          console.log("Shell command output:", output);
          this._showOutput(output);
        })
        .catch(err => {
          console.error("Shell command error:", err);
          this._showOutput(err.message || err, true);
        });
    } else if (lang === "typescript") {
      try {
        ipcRenderer.invoke("run-ts-code", code)
          .then(output => {
            console.log("Shell command output:", output);
            this._showOutput(output);
          })
          .catch(err => {
            console.error("Shell command error:", err);
            this._showOutput(err.message || err, true);
          });
      } catch (error) {
        this._showOutput("TypeScript transpile error: " + error.message, true);
      }

    } else if (lang === "shell") {

      ipcRenderer.invoke("run-shell-command", code)
        .then(output => {
          console.log("Shell command output:", output);
          this._showOutput(output);
        })
        .catch(err => {
          console.error("Shell command error:", err);
          this._showOutput(err.message || err, true);
        });

    } else if (lang === "sqlite") {
      console.log("SQLite is calling")
      ipcRenderer.invoke("run-sqlite-command", code)
        .then(output => {
          this._showOutput(output);
        })
        .catch(err => {
          console.error("SQL command error:", err);
          this._showOutput(err.message || err, true);
        });
    }
    else if (lang === "sql") {
      console.log("SQL is calling")
      ipcRenderer.invoke("run-sql-command", code)
        .then(output => {
          this._showOutput(output);
        })
        .catch(err => {
          console.error("SQL command error:", err);
          this._showOutput(err.message || err, true);
        });
    }
    else if (lang === "java") {
      console.log("Executing JAVA")
      ipcRenderer.invoke("run-java-code", code)
        .then(output => {
          console.log("JAVA command output:", output);
          this._showOutput(output);
        })
        .catch(err => {
          console.error("JAVA command error:", err);
          this._showOutput(err.message || err, true);
        });

    }

  }
  _showOutput(message, isError = false) {
    this.lastOutput = message;
    this.lastIsError = isError;
    this.outputContainer.classList.remove("display-none");
    this.outputContainer.innerHTML = "";

    const terminalHeader = document.createElement("div");
    terminalHeader.classList.add(
      "terminal-header",
      "flex",
      "items-center",
      "text-sm",
      "text-slate-300",
      "mb-3"
    );
    terminalHeader.innerHTML = `
      <span class="terminal-icon text-blue-600">
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#6b1cff" stroke-width="0.416"><g fill="#6b1cff"><path d="M3.23 3.174a.75.75 0 00-.96 1.152L6.078 7.5 2.27 10.674a.75.75 0 10.96 1.152l4.5-3.75a.75.75 0 000-1.152l-4.5-3.75zM7.75 12a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z"/></g></svg>
      </span>
      <span class="font-medium text-slate-300"> Console Output:</span>
    `;
    // Table view toggle button
    const tableToggleBtn = document.createElement('button');
    tableToggleBtn.className = 'ml-auto bg-gray-500 hover:bg-blue-700 rounded text-sm border-0 !rounded-button whitespace-nowrap cursor-pointer text-white px-2 py-1 rounded flex items-center';
    tableToggleBtn.title = this.outputViewMode === 'table' ? 'Show Raw Output' : 'Show Table Output';
    tableToggleBtn.innerHTML = this.outputViewMode === 'table'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>language_json</title> <rect width="24" height="24" fill="none"></rect> <path d="M5,3H7V5H5v5a2,2,0,0,1-2,2,2,2,0,0,1,2,2v5H7v2H5c-1.07-.27-2-.9-2-2V15a2,2,0,0,0-2-2H0V11H1A2,2,0,0,0,3,9V5A2,2,0,0,1,5,3M19,3a2,2,0,0,1,2,2V9a2,2,0,0,0,2,2h1v2H23a2,2,0,0,0-2,2v4a2,2,0,0,1-2,2H17V19h2V14a2,2,0,0,1,2-2,2,2,0,0,1-2-2V5H17V3h2M12,15a1,1,0,1,1-1,1,1,1,0,0,1,1-1M8,15a1,1,0,1,1-1,1,1,1,0,0,1,1-1m8,0a1,1,0,1,1-1,1A1,1,0,0,1,16,15Z"></path> </g></svg>`
      : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`;
    tableToggleBtn.style.marginLeft = 'auto';
    tableToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.outputViewMode = this.outputViewMode === 'table' ? 'raw' : 'table';
      this._showOutput(this.lastOutput, this.lastIsError);
    });
    terminalHeader.appendChild(tableToggleBtn);
    this.outputContainer.appendChild(terminalHeader);

    // Render output
    if (this.outputViewMode === 'table' && this._isJsonArray(message)) {
      this.outputContainer.appendChild(this._renderTableFromJson(message));
    } else {
      // 🛠 Make sure message is a string before split
      const outputText =
        typeof message === "string"
          ? message
          : JSON.stringify(message, null, 2); // Pretty-print objects

      outputText.split("\n").forEach((line) => {
        const lineDiv = document.createElement("div");
        lineDiv.className = isError ? "log error" : "log";
        lineDiv.textContent = line;
        this.outputContainer.appendChild(lineDiv);
      });
    }
  }

  _isJsonArray(data) {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object';
      } catch {
        return false;
      }
    }
    return Array.isArray(data) && data.length > 0 && typeof data[0] === 'object';
  }

  _renderTableFromJson(data) {
    let arr = data;
    if (typeof data === 'string') {
      try {
        arr = JSON.parse(data);
      } catch {
        return document.createTextNode('Invalid JSON');
      }
    }
    if (!Array.isArray(arr) || arr.length === 0) {
      return document.createTextNode('No data');
    }
    const table = document.createElement('table');
    table.className = 'json-table-output';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '8px';
    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(arr[0]).forEach(key => {
      const th = document.createElement('th');
      th.textContent = key;
      th.style.border = '1px solid #475569';
      th.style.background = '#23272e';
      th.style.color = '#f1f5f9';
      th.style.padding = '6px 10px';
      th.style.fontWeight = 'bold';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    // Table body
    const tbody = document.createElement('tbody');
    arr.forEach(row => {
      const tr = document.createElement('tr');
      Object.keys(arr[0]).forEach(key => {
        const td = document.createElement('td');
        td.textContent = row[key];
        td.style.border = '1px solid #475569';
        td.style.padding = '6px 10px';
        td.style.background = '#161b22';
        td.style.color = '#a7f3d0';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  _copyCode(button) {
    const code = this.editor.getValue();
    try {
      // Use browser clipboard API
      navigator.clipboard.writeText(code);
      button.textContent = "Copied";
      setTimeout(() => {
        button.innerHTML = `
        <span class="mr-1" style="display: inline-flex; position: relative; top: 3px; width: 16px; height: 16px;">
          <svg width="256px" height="256px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z" fill="#ffffff"></path> <path d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z" fill="#ffffff"></path> </g></svg>
        </span> Copy
      `;
      }, 2000); // Revert back to "Copy" after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  save(blockContent) {
    const container = blockContent.querySelector(".code-editor-container");

    return {
      code: this.editor.getValue(),
      language: this.selectedLang, // Save the selected language
      width: container.dataset.width,
      height: container.dataset.height,
    };
  }
}
