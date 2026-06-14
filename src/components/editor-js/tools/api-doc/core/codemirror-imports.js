// Import CodeMirror core
import CodeMirror from 'codemirror';

// Import theme
import 'codemirror/theme/eclipse.css';

// Import JavaScript/JSON mode
import 'codemirror/mode/javascript/javascript';

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

// Make CodeMirror globally available
window.CodeMirror = CodeMirror;

export default CodeMirror;
