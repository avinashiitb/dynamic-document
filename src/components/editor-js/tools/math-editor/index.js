import MathEditor from "editorjs-mathlive";

export default class CustomMathTool extends MathEditor {
    constructor({ data, api, config = {}, ...rest }) {
        super({ data, api, config, ...rest });
    }

    render() {
        const wrapper = super.render();

        // Add event listeners to prevent EditorJS from hijacking keyboard events
        if (wrapper) {
            wrapper.addEventListener('keydown', (event) => {
                // Stop propagation for all keyboard events to prevent EditorJS interference
                event.stopPropagation();
            });

            wrapper.addEventListener('keyup', (event) => {
                event.stopPropagation();
            });

            wrapper.addEventListener('keypress', (event) => {
                event.stopPropagation();
            });

            // Also prevent EditorJS from handling delete/backspace on the wrapper
            wrapper.addEventListener('input', (event) => {
                event.stopPropagation();
            });

            // Prevent EditorJS from handling paste events
            wrapper.addEventListener('paste', (event) => {
                event.stopPropagation();
            });

            // Prevent EditorJS from handling cut events
            wrapper.addEventListener('cut', (event) => {
                event.stopPropagation();
            });
        }

        return wrapper;
    }

    static get toolbox() {
        return {
            title: "Math",
            icon: `<svg fill="#000000" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1919.989 168.955V394.95h-832.716l-476.16 1251.388-212.78-4.743-194.373-588.537H-.01V827.176h285.515l107.294 77.59L513.08 1268.89 903.857 241.802l105.6-72.847h910.532ZM1265.72 788.99l240.177 240.176 240.162-240.12 159.7 159.586-240.2 240.197 240.2 240.198-159.7 159.586-240.163-240.12-240.176 240.177-159.698-159.7 240.183-240.141-240.183-240.14 159.698-159.7Z" fill-rule="evenodd"></path> </g></svg>`,
        };
    }
} 