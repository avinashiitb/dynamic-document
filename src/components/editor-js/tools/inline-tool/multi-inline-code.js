// tools/inline-tool/multi-inline-code.js
import "./inline-tool.css";

export default class MultiInlineCode {
  static get isInline() {
    return true;
  }

  static get sanitize() {
    return {
      code: {
        class: true,
      },
    };
  }

  tag = "CODE";
  codeClass = "cdx-inline-code";
  _highlighted = false;

  surround(range) {
    if (!range || range.collapsed) return;

    // Check if the selection is already wrapped in a code tag
    const parentCodeTag = this._getParentTagFromNode(
      range.commonAncestorContainer
    );

    if (parentCodeTag) {
      // If already wrapped, unwrap it (toggle off)
      this.clear(range);
    } else {
      // If not wrapped, wrap it (toggle on)
      const selectedText = range.extractContents();
      const code = document.createElement(this.tag);
      code.classList.add(this.codeClass);
      code.appendChild(selectedText);
      range.insertNode(code);

      // Restore selection on the newly inserted code
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(code);
        selection.addRange(newRange);
      }
    }
  }

  checkState(selection) {
    const anchorElement = this._getParentTagFromNode(
      selection?.anchorNode || null
    );
    this._highlighted = !!anchorElement;
    return this._highlighted;
  }

  get state() {
    return this._highlighted;
  }

  render() {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 8L5 11.6923L9 16M15 8L19 11.6923L15 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    button.classList.add("cdx-inline-tool");
    button.setAttribute("data-empty", "false");
    return button;
  }

  clear(range) {
    const parentTag = this._getParentTagFromNode(
      range?.commonAncestorContainer || null
    );
    if (parentTag) {
      const unwrappedText = document.createTextNode(
        parentTag.textContent || ""
      );
      parentTag.replaceWith(unwrappedText);
    }
  }

  _getParentTagFromNode(node) {
    let el = node instanceof HTMLElement ? node : node?.parentElement;
    while (el && el !== document.body) {
      if (el.tagName === this.tag) return el;
      el = el.parentElement;
    }
    return null;
  }
}
