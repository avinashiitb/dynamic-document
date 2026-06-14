export class EmojiReplacer {
    static get isInline() {
        return true;
    }

    constructor({ data }) {
        this.data = data || {};
    }

    render() {
        const span = document.createElement('span');
        span.classList.add('emoji-inline');
        span.textContent = this.data.text || '';
        return span;
    }

    surround(range) {
        const selectedText = range.toString();

        const replaced = selectedText
            .replace(/->/g, rightArrowSVG)
            .replace(/<-/g, leftArrowSVG)
            .replace(/<3/g, heartSVG);

        const span = this.render();
        span.innerHTML = replaced;

        // 👇 Inject span into the actual DOM
        range.deleteContents();
        range.insertNode(span);
    }


    static get sanitize() {
        return {
            text: true
        };
    }

    save(span) {
        return {
            text: span.textContent
        };
    }
}
