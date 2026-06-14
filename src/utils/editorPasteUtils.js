/**
 * Utility functions for handling paste events in Editor.js tools.
 */

export const getCodeBlockPasteConfig = () => {
  return {
    tags: ['pre', 'code'],
    patterns: {
      code: /```([\s\S]*?)```/
    }
  };
};

export const getBlockquotePasteConfig = () => {
  return {
    tags: ['BLOCKQUOTE', 'blockquote'],
    patterns: {
      quote: /^>\s(.*)$/
    }
  };
};

/**
 * Robustly extracts text from an HTML element, preserving logical newlines.
 * Useful for detached elements where innerText might be empty.
 */
export const extractTextFromHtml = (html) => {
  let content = html;
  
  // Replace block-level breaks with newlines
  content = content.replace(/<br\s*\/?>/gi, '\n');
  content = content.replace(/<\/p><p>/gi, '\n');
  content = content.replace(/<\/div><div>/gi, '\n');
  content = content.replace(/<li>/gi, '\n- '); // Basic list handling
  
  const tmp = document.createElement('div');
  tmp.innerHTML = content;
  return tmp.textContent || tmp.innerText || "";
};

/**
 * Normalizes the Editor.js paste event to ensure data and type are correctly identified.
 */
export const getPasteData = (event) => {
  const detail = event.detail || {};
  const data = detail.data;
  let type = detail.type;

  // Fallback type identification
  if (!type && data instanceof HTMLElement) {
    type = 'tag';
  } else if (!type && typeof data === 'string') {
    type = 'pattern';
  }

  return { data, type };
};

/**
 * Specifically processes paste content for Code Block tools.
 * Can be extended later with specific logic for 'word', 'markdown', etc.
 */
export const processCodePaste = (event) => {
  const { data, type } = getPasteData(event);

  if (type === 'tag' && data instanceof HTMLElement) {
    return extractTextFromHtml(data.innerHTML);
  }

  if (type === 'pattern' && typeof data === 'string') {
    // Handle Markdown code fences
    if (data.startsWith('```') && data.endsWith('```')) {
      return data.replace(/^```|```$/g, '').trim();
    }
    return data;
  }

  return "";
};

export const processBlockquotePaste = (event) => {
  const { data, type } = getPasteData(event);

  if (type === 'tag' && data instanceof HTMLElement) {
    return extractTextFromHtml(data.innerHTML);
  }

  if (type === 'pattern' && typeof data === 'string') {
    return data.replace(/^>\s?/, "").trim();
  }

  return "";
};

export const sanitizeCodeBlock = (data) => {
    return data;
};
