import { getBlockquotePasteConfig, processBlockquotePaste } from '../../../../utils/editorPasteUtils';

export default class BlockQuoteTool {
  static get toolbox() {
    return {
      title: "Blockquote",
      icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" fill="currentColor"/></svg>'
    };
  }

  static get pasteConfig() {
    return getBlockquotePasteConfig();
  }

  onPaste(event) {
    const text = processBlockquotePaste(event);
    if (text) {
      this.data = {
        html: text
      };

      // Update wrapper if it exists (for immediate feedback)
      if (this.wrapper) {
        const para = this.wrapper.querySelector("p");
        if (para) {
          para.innerHTML = text;
        }
      }
    }
  }

  static get sanitize() {
    return {
      html: true
    };
  }

  constructor({ data }) {
    this.data = data || { html: "" };
    this.wrapper = null;
  }

  render() {
    const para = document.createElement("p");
    para.className = "dev-scribe-blockquote-p";
    para.contentEditable = true;
    para.setAttribute("data-placeholder", "Write blockquote ...");

    para.innerHTML = this.data.html || "";

    this.wrapper = document.createElement("blockquote");
    this.wrapper.className = "custom-blockquote";
    this.wrapper.appendChild(para);

    return this.wrapper;
  }


  save(blockContent) {
    const para = blockContent.querySelector("p");
    return {
      html: para ? para.innerHTML.trim() : "",
    };
  }

  validate(savedData) {
    return !!savedData.html && savedData.html.trim() !== "";
  }
}
