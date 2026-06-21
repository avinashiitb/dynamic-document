// EditorComponent.js
import React, { useEffect, useRef, useState, useMemo } from "react";
import EditorJS from "@editorjs/editorjs";
import _ from "lodash";
import CopyTune from "./tunes/CopyTune";
import PasteTune from "./tunes/PasteTune";
import EmojiPickerTool from "@plebjs/editorjs-emoji-picker-tool";

import Header from "@editorjs/header";
import NestedList from "@editorjs/nested-list";
import LinkTool from "@editorjs/link";
import ListTool from "@editorjs/list";
import SimpleImageTool from "@editorjs/simple-image";
import Alert from "editorjs-alert";
import ParagraphTool from "@editorjs/paragraph";
import EmbedTool from "@editorjs/embed";
import QuoteTool from "@editorjs/quote";
import WarningTool from "@editorjs/warning";
import TableTool from "@editorjs/table";
import DelimiterTool from "@coolbytes/editorjs-delimiter";
import ChecklistTool from "@editorjs/checklist";
import AlignmentTuneTool from "editorjs-text-alignment-blocktune";
import Callout from "@itech-indrustries/editorjs-callout";
import Quote from "@editorjs/quote";
import BreakLine from "editorjs-break-line";
import RawTool from "./tools/code-block";

import ColorPlugin from "@avinashiitb/text-color-plugin";
import MultiInlineCode from "./tools/inline-tool/multi-inline-code";
import Strikethrough from "@sotaproject/strikethrough";
import Underline from "@editorjs/underline";
import EditorJSInlineHotkey from "editorjs-inline-hotkey";

import DragDrop from "editorjs-drag-drop";
import BlockQuoteTool from "./tools/block-quote";

// Custom math tool with proper keyboard handling
import CustomMathTool from "./tools/math-editor";
import ApiDocumentTool from "./tools/api-doc";

import { SimpleImage } from "./tools/simple-image";
import { VideoTool } from "./tools/video";
import { JSCodeTool } from "./tools/code-editor";
import { DiagramlyBlock } from "./tools/join-js";

// Safe wrapper for ipcRenderer using window.pluginAPI
const ipcRenderer = {
  invoke: async (channel, ...args) => {
    if (window.pluginAPI && window.pluginAPI.messaging) {
      return await window.pluginAPI.messaging.invoke(channel, ...args);
    }
    console.warn(`[Mock ipcRenderer] window.pluginAPI.messaging is not available for channel: ${channel}`);

    // Mock local storage fallback for web/standalone testing
    if (channel === "getDocumentsByParentFile") {
      const fileId = args[0];
      try {
        const stored = localStorage.getItem(`doc_${fileId}`);
        if (stored) {
          return [JSON.parse(stored)];
        }
      } catch (e) {
        console.error("Failed to load from local storage:", e);
      }
      return [];
    }

    if (channel === "updateDocument") {
      const { parent_file, content } = args[0] || {};
      if (parent_file && content && content.length > 0) {
        try {
          localStorage.setItem(`doc_${parent_file}`, JSON.stringify(content[0]));
        } catch (e) {
          console.error("Failed to save to local storage:", e);
        }
      }
      return { success: true };
    }

    return null;
  }
};

const inlineToolbar = [
  "link",
  "bold",
  "italic",
  "MultiInlineCode",
  "TextColor",
  "TextBackground",
];

const EditorComponent = ({ fileId, isPreview }) => {
  const id = fileId;
  const [isPageLocked, setPageLock] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [fileName, setFileName] = useState("Untitled");
  const [lastEdited, setLastEdited] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [content, setContent] = useState(null);

  const versionRef = useRef(1);
  const ejInstance = useRef(null);
  const isEditorInitialized = useRef(false);
  const dropdownRef = useRef(null);

  // Force light theme and white background in all cases
  useEffect(() => {
    const forceLightTheme = () => {
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#374151";
      const htmlElement = document.documentElement;
      if (htmlElement) {
        htmlElement.style.backgroundColor = "#ffffff";
        htmlElement.style.color = "#374151";
      }
    };
    forceLightTheme();

    const handleThemeEvent = () => {
      forceLightTheme();
    };

    window.addEventListener("message", handleThemeEvent);
    window.addEventListener("theme-changed", handleThemeEvent);

    return () => {
      window.removeEventListener("message", handleThemeEvent);
      window.removeEventListener("theme-changed", handleThemeEvent);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch file details and nested path
  useEffect(() => {
    if (window.pluginAPI && id) {
      window.pluginAPI.getFileDetailsById(id).then(details => {
        if (details) {
          setFileName(details.title || "Untitled");
          setLastEdited(details.lastEdited);
        }
      }).catch(err => console.warn(err));

      if (window.pluginAPI.getNestedPath) {
        window.pluginAPI.getNestedPath({ fileId: id }).then(result => {
          if (result) {
            const segs = [
              ...result.folders.map((f) => ({ label: f.name, isFile: false })),
              ...(result.file ? [{ label: result.file.title, isFile: true }] : []),
            ];
            setBreadcrumbs(segs);
          }
        }).catch(err => console.warn(err));
      }
    } else if (id) {
      // Fallback for standalone browser testing
      setFileName("Web Test Document");
      setLastEdited(new Date().getTime());
      setBreadcrumbs([
        { label: "Web Playground", isFile: false },
        { label: "Web Test Document", isFile: true }
      ]);
    }
  }, [id]);

  const isMeaningfulChange = (prevBlocks, nextBlocks) => {
    return !_.isEqualWith(
      prevBlocks,
      nextBlocks,
      (a, b, key) => {
        if (typeof key === "string") {
          if (
            ["display", "r", "cursor", "fillOpacity", "strokeOpacity"].includes(
              key
            )
          ) {
            return true;
          }
          if (["time", "version", "id"].includes(key)) {
            return true;
          }
        }
        return undefined;
      }
    );
  };

  // Custom undo/redo state management
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const maxStackSize = 50;
  const isUndoRedoOperation = useRef(false);

  const saveToUndoStack = async () => {
    if (!ejInstance.current || isUndoRedoOperation.current) return;
    try {
      const currentData = await ejInstance.current.saver.save();
      const stateSnapshot = {
        blocks: JSON.parse(JSON.stringify(currentData.blocks)),
        time: currentData.time,
        version: currentData.version,
      };

      const lastState = undoStack.current[undoStack.current.length - 1];
      if (
        lastState &&
        !isMeaningfulChange(lastState.blocks, stateSnapshot.blocks)
      ) {
        return;
      }

      undoStack.current.push(stateSnapshot);

      if (undoStack.current.length > maxStackSize) {
        undoStack.current.shift();
      }

      redoStack.current = [];
    } catch (error) {
      console.error("Failed to save state to undo stack:", error);
    }
  };

  const performUndo = async () => {
    if (!ejInstance.current || undoStack.current.length < 2) return;
    try {
      isUndoRedoOperation.current = true;
      const currentState = undoStack.current.pop();
      redoStack.current.push(currentState);

      const previousState = undoStack.current[undoStack.current.length - 1];

      if (previousState) {
        await ejInstance.current.clear();
        await ejInstance.current.render({
          blocks: previousState.blocks,
          time: previousState.time,
          version: previousState.version,
        });

        const updatedContent = {
          _id: content?._id || id,
          parent_file: id,
          time: previousState.time,
          blocks: previousState.blocks,
          version: versionRef.current,
        };

        await ipcRenderer.invoke("updateDocument", {
          parent_file: id,
          content: [updatedContent],
        });

        setContent(updatedContent);
      }
    } catch (error) {
      console.error("Failed to perform undo:", error);
    } finally {
      setTimeout(() => (isUndoRedoOperation.current = false), 100);
    }
  };

  const performRedo = async () => {
    if (!ejInstance.current || redoStack.current.length === 0) return;
    try {
      isUndoRedoOperation.current = true;
      const nextState = redoStack.current.pop();
      undoStack.current.push(nextState);

      if (nextState) {
        await ejInstance.current.clear();
        await ejInstance.current.render({
          blocks: nextState.blocks,
          time: nextState.time,
          version: nextState.version,
        });

        const updatedContent = {
          _id: content?._id || id,
          parent_file: id,
          time: nextState.time,
          blocks: nextState.blocks,
          version: versionRef.current,
        };

        await ipcRenderer.invoke("updateDocument", {
          parent_file: id,
          content: [updatedContent],
        });

        setContent(updatedContent);
      }
    } catch (error) {
      console.error("Failed to perform redo:", error);
    } finally {
      setTimeout(() => (isUndoRedoOperation.current = false), 100);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeEditor = async () => {
      try {
        if (ejInstance.current) {
          ejInstance.current.destroy();
          ejInstance.current = null;
        }
        isEditorInitialized.current = false;

        const documentData = await ipcRenderer.invoke(
          "getDocumentsByParentFile",
          id
        );

        if (!isMounted) return;

        setContent(
          Array.isArray(documentData) && documentData.length > 0 ? documentData[0] : null
        );

        const contentIndex = Array.isArray(documentData)
          ? documentData.findIndex((item) => item.parent_file === id)
          : -1;

        let currentContent =
          contentIndex !== -1
            ? documentData[contentIndex]
            : {
              _id: id,
              parent_file: id,
              blocks: [],
              time: new Date().getTime(),
              version: 1,
            };

        versionRef.current = currentContent?.version || 1;

        const editor = new EditorJS({
          holder: `editorjs-${id}`,
          onReady: () => {
            if (!isMounted) return;
            new DragDrop(editor);
            ejInstance.current = editor;
            isEditorInitialized.current = true;
          },
          autofocus: true,
          data: {
            blocks: currentContent.blocks || [
              {
                type: "paragraph",
                data: {
                  text: "",
                },
              },
            ],
            time: currentContent.time || new Date().getTime(),
            version: currentContent.version || 1,
          },

          onChange: async () => {
            if (ejInstance.current !== null && editor) {
              try {
                if (!isUndoRedoOperation.current) {
                  await saveToUndoStack();
                }

                const savedContent = await editor.saver.save();
                const currentVersion = versionRef.current;

                const updatedContent = {
                  _id: content?._id || id,
                  parent_file: id,
                  time: savedContent.time,
                  blocks: savedContent.blocks,
                  version: currentVersion,
                };

                await ipcRenderer.invoke("updateDocument", {
                  parent_file: id,
                  content: [updatedContent],
                });

                versionRef.current = currentVersion + 1;
                setContent({
                  ...updatedContent,
                  version: versionRef.current,
                });
              } catch (error) {
                console.error("Update failed:", error);
                const message = typeof error === "string" ? error : error?.message || "";

                if (message.includes("VERSION_CONFLICT")) {
                  try {
                    setIsRefreshing(true);
                    const freshDoc = await ipcRenderer.invoke(
                      "getDocumentsByParentFile",
                      id
                    );

                    if (Array.isArray(freshDoc) && freshDoc.length > 0) {
                      const latest = freshDoc[0];
                      versionRef.current = latest.version;
                      setContent({
                        ...latest,
                        blocks: latest.blocks,
                        version: latest.version,
                      });

                      if (ejInstance.current) {
                        try {
                          await ejInstance.current.clear();
                          await ejInstance.current.render({
                            blocks: latest.blocks || [],
                            time: latest.time || new Date().getTime(),
                            version: latest.version,
                          });
                        } catch (renderError) {
                          console.error("Failed to reload editor:", renderError);
                          window.location.reload();
                        }
                      }
                      await new Promise((resolve) => setTimeout(resolve, 300));
                    }
                  } catch (fetchError) {
                    console.error("Failed to refresh after version conflict:", fetchError);
                  } finally {
                    setIsRefreshing(false);
                  }
                  return;
                }
              }
            }
          },
          placeholder: "Let's write an awesome story!",
          tools: {
            copy: CopyTune,
            paste: PasteTune,

            paragraph: {
              class: ParagraphTool,
              inlineToolbar: true,
              tunes: ["textAlignment", "copy", "paste"],
            },

            header: {
              class: Header,
            },
            headerH1: {
              class: Header,
              toolbox: {
                title: "Heading 1",
                icon: `<svg style="width: 15px !important; height: 15px !important;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 10L19 9L19 19M3 5V12M3 12V19M3 12H11M11 5V12M11 12V19" stroke="#000000" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
              },
              config: {
                levels: [1],
                defaultLevel: 1,
                defaultAlignment: "left",
              },
              conversionConfig: {
                export: (data) => data.text,
                import: (text) => ({ text, level: 1 }),
              },
              inlineToolbar: true,
              tunes: ["copy", "paste"],
            },
            headerH2: {
              class: Header,
              toolbox: {
                title: "Heading 2",
                icon: `<svg style="width: 15px !important; height: 15px !important;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 12.5V12C15 10.3431 16.3431 9 18 9H18.1716C19.7337 9 20.9996 10.2665 20.9996 11.8286C20.9996 12.5788 20.702 13.2982 20.1716 13.8286L15 19.0002L21 19M3 5V12M3 12V19M3 12H11M11 5V12M11 12V19" stroke="#000000" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
              },
              config: {
                levels: [2],
                defaultLevel: 2,
              },
              conversionConfig: {
                export: (data) => data.text,
                import: (text) => ({ text, level: 2 }),
              },
              inlineToolbar: true,
              tunes: ["copy", "paste"],
            },
            headerH3: {
              class: Header,
              toolbox: {
                title: "Heading 3",
                icon: `<svg style="width: 15px !important; height: 15px !important;"  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 9H21L17 13H18C19.6569 13 21 14.3431 21 16C21 17.6569 19.6569 19 18 19C17.3793 19 16.7738 18.8077 16.2671 18.4492C15.7604 18.0907 15.3775 17.5838 15.1709 16.9985M3 5V12M3 12V19M3 12H11M11 5V12M11 12V19" stroke="#000000" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
              },
              config: {
                levels: [3],
                defaultLevel: 3,
              },
              conversionConfig: {
                export: (data) => data.text,
                import: (text) => ({ text, level: 3 }),
              },
              inlineToolbar: true,
              tunes: ["copy", "paste"],
            },
            headerH4: {
              class: Header,
              toolbox: {
                title: "Heading 4",
                icon: `<svg style="width: 15px !important; height: 15px !important;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 9L15.5 17H20M20 17H21M20 17V14M20 17V19M3 5V12M3 12V19M3 12H11M11 5V12M11 12V19" stroke="#000000" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
              },
              config: {
                levels: [4],
                defaultLevel: 4,
              },
              conversionConfig: {
                export: (data) => data.text,
                import: (text) => ({ text, level: 4 }),
              },
              inlineToolbar: true,
              tunes: ["copy", "paste"],
            },
            headerH5: {
              class: Header,
              toolbox: {
                title: "Heading 5",
                icon: `<svg style="width: 15px !important; height: 15px !important;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 9H17L15.75 14.0158C15.8285 13.9268 15.912 13.8429 16 13.7642C16.3509 13.4504 16.7731 13.2209 17.2346 13.0991C17.9263 12.9166 18.6611 12.9876 19.3053 13.2987C19.9495 13.6099 20.4608 14.1414 20.7479 14.7967C21.035 15.452 21.0788 16.188 20.8707 16.8725C20.6627 17.557 20.2165 18.1447 19.6133 18.5295C19.0101 18.9142 18.2895 19.0704 17.5811 18.9704C16.8726 18.8705 16.2232 18.521 15.75 17.9844M3 5V12M3 12V19M3 12H11M11 5V12M11 12V19" stroke="#000000" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
              },
              config: {
                levels: [5],
                defaultLevel: 5,
              },
              conversionConfig: {
                export: (data) => data.text,
                import: (text) => ({ text, level: 5 }),
              },
              inlineToolbar: true,
              tunes: ["copy", "paste"],
            },
            headerH6: {
              class: Header,
              toolbox: {
                title: "Heading 6",
                icon: `<svg style="width: 15px !important; height: 15px !important;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4024 14.5249C14.574 15.9516 15.0656 17.7759 16.5005 18.5997C17.9354 19.4234 19.7701 18.9346 20.5986 17.5078C21.427 16.0811 20.9352 14.2571 19.5003 13.4334C18.0655 12.6097 16.2309 13.0982 15.4024 14.5249ZM15.4024 14.5249L18.9998 8M3 5V12M3 12V19M3 12H11M11 5V12M11 12V19" stroke="#000000" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
              },
              config: {
                levels: [6],
                defaultLevel: 6,
              },
              conversionConfig: {
                export: (data) => data.text,
                import: (text) => ({ text, level: 6 }),
              },
              inlineToolbar: true,
              tunes: ["copy", "paste"],
            },

            list: {
              class: ListTool,
              inlineToolbar: true,
              tunes: ["copy", "paste"],
              shortcut: "CMD+SHIFT+L",
              config: {
                defaultStyle: "unordered",
              },
            },

            jointjsBlock: {
              class: DiagramlyBlock,
              tunes: ["copy", "paste"],
            },
            jsCode: {
              class: JSCodeTool,
              tunes: ["copy", "paste"],
            },
            code: {
              class: RawTool,
              inlineToolbar: true,
              tunes: ["copy", "paste"],
            },

            apiDoc: {
              class: ApiDocumentTool,
              tunes: ["copy", "paste"],
              config: {
                defaultMethod: "GET",
                defaultUrl: "",
                defaultAuth: "No Auth",
                fileId: id,
              },
            },

            callout: {
              class: Callout,
              inlineToolbar: true,
              tunes: ["textAlignment", "copy", "paste"],
              shortcut: "CMD+SHIFT+C",
              config: {
                defaultType: "info",
                defaultEmoji: "ℹ️",
              },
              toolbox: {
                title: "Callout",
                icon: `<svg style="width: 15px !important; height: 15px !important;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 10C10 10.5523 10.4477 11 11 11V17C10.4477 17 10 17.4477 10 18C10 18.5523 10.4477 19 11 19H13C13.5523 19 14 18.5523 14 18C14 17.4477 13.5523 17 13 17V9H11C10.4477 9 10 9.44772 10 10Z" fill="#0F0F0F"></path><path d="M12 8C12.8284 8 13.5 7.32843 13.5 6.5C13.5 5.67157 12.8284 5 12 5C11.1716 5 10.5 5.67157 10.5 6.5C10.5 7.32843 11.1716 8 12 8Z" fill="#0F0F0F"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M23 4C23 2.34315 21.6569 1 20 1H4C2.34315 1 1 2.34315 1 4V20C1 21.6569 2.34315 23 4 23H20C21.6569 23 23 21.6569 23 20V4ZM21 4C21 3.44772 20.5523 3 20 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V4Z" fill="#0F0F0F"></path></svg>`,
              },
            },
            alert: {
              class: Alert,
              inlineToolbar: true,
              config: {
                defaultType: "info",
                defaultEmoji: "ℹ️",
              },
            },
            blockquote: {
              class: BlockQuoteTool,
              shortcut: "CMD+SHIFT+Q",
              inlineToolbar: true,
              tunes: ["copy", "paste"],
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              tunes: ["copy", "paste"],
              shortcut: "CMD+SHIFT+O",
              config: {
                quotePlaceholder: "Enter a quote",
                captionPlaceholder: "Quote's author",
              },
            },

            table: {
              class: TableTool,
              inlineToolbar: true,
              config: {
                rows: 2,
                cols: 3,
                maxRows: 5,
                maxCols: 5,
              },
              tunes: ["copy", "paste"],
            },
            image: {
              class: SimpleImage,
              tunes: ["copy", "paste"],
            },
            video: {
              class: VideoTool,
              tunes: ["copy", "paste"],
            },
            embed: {
              class: EmbedTool,
              config: {
                services: {
                  youtube: true,
                  coub: true,
                },
              },
              tunes: ["copy", "paste"],
            },

            delimiter: {
              class: DelimiterTool,
              tunes: ["copy", "paste"],
            },
            breakLine: {
              class: BreakLine,
              inlineToolbar: true,
              tunes: ["copy", "paste"],
              shortcut: "CMD+SHIFT+ENTER",
            },

            textAlignment: {
              class: AlignmentTuneTool,
              config: {
                default: "left",
                blocks: {
                  header: "left",
                  list: "left",
                },
              },
            },

            math: {
              class: CustomMathTool,
              inlineToolbar: true,
              config: {
                virtualKeyboardMode: "manual",
                defaultMode: "math",
                smartMode: false,
                virtualKeyboardTheme: "material",
              },
            },

            emoji: {
              class: EmojiPickerTool,
            },
            MultiInlineCode: {
              class: MultiInlineCode,
              shortcut: "CMD+SHIFT+M",
            },
            strikethrough: Strikethrough,
            underline: Underline,

            Marker: {
              class: ColorPlugin,
              config: {
                type: "marker",
                markerColors: [
                  "#FFF176", "#FFEB3B", "#FFC107", "#FF9800", "#FFB74D", "#FFD180",
                  "#FF8A80", "#F44336", "#E91E63", "#F48FB1", "#EC407A",
                  "#CE93D8", "#BA68C8", "#9C27B0", "#AB47BC",
                  "#90CAF9", "#64B5F6", "#2196F3", "#03A9F4", "#4FC3F7",
                  "#A5D6A7", "#81C784", "#4CAF50", "#CDDC39", "#AED581",
                  "#BDBDBD", "#9E9E9E", "#78909C", "#607D8B",
                ],
                defaultColor: "#FFEB3B",
                customPicker: true,
                icon: `<svg fill="#000000" height="200px" width="200px" viewBox="0 0 32 32"><g><path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path><path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path></g><g><path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path></g></svg>`,
              },
            },
            TextColor: {
              class: ColorPlugin,
              config: {
                type: "text",
                colorCollections: [
                  "#FF1300", "#FF5722", "#FF7043", "#FF9800", "#FFC107", "#FFD54F",
                  "#FFE500", "#CDDC39", "#8BC34A", "#4CAF50", "#2E7D32", "#009688",
                  "#0070FF", "#03A9F4", "#00BCD4", "#2196F3", "#3F51B5", "#1A237E",
                  "#9C27B0", "#673AB7", "#9575CD", "#B39DDB", "#7E57C2",
                  "#795548", "#9E9E9E", "#757575", "#5A5A5A", "#424242",
                  "#FFFFFF",
                ],
                defaultColor: "#FF1300",
                customPicker: true,
              },
            },
            TextBackground: {
              class: ColorPlugin,
              config: {
                type: "background",
                backgroundColors: [
                  "#FFFDE7", "#FFF8E1", "#FFF3E0", "#FFEBEE", "#FFE0B2",
                  "#F1F8E9", "#E8F5E9", "#DCEDC8", "#C8E6C9", "#AED581",
                  "#E0F7FA", "#E1F5FE", "#B3E5FC", "#BBDEFB", "#B2EBF2",
                  "#F3E5F5", "#E1BEE7", "#F8BBD0", "#FCE4EC",
                  "#F5F5F5", "#EEEEEE", "#E0E0E0", "#FFFFFF",
                ],
                defaultColor: "#FFFACD",
                customPicker: true,
              },
            },
            InlineHotkey: EditorJSInlineHotkey,
          },
        });
      } catch (error) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.code === "VERSION_CONFLICT") {
            const documentData = await ipcRenderer.invoke(
              "getDocumentsByParentFile",
              id
            );
            setContent(documentData);
            return;
          }
        } catch {
          console.error("Error updating content:", error);
        }
      }
    };

    initializeEditor();

    return () => {
      isMounted = false;
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [id]);

  // Keyboard event handler for undo/redo
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        event.stopPropagation();
        performUndo();
      }
      else if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        event.shiftKey
      ) {
        event.preventDefault();
        event.stopPropagation();
        performRedo();
      }
      else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        event.preventDefault();
        event.stopPropagation();
        performRedo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [performUndo, performRedo]);

  useEffect(() => {
    const editorElement = document.getElementById(`editorjs-${id}`);
    if (!editorElement) return;

    const handleInput = (event) => {
      const selection = window.getSelection();
      if (!selection || !selection.focusNode || selection.focusNode.nodeType !== Node.TEXT_NODE) return;

      const textNode = selection.focusNode;
      const cursorOffset = selection.focusOffset;
      const text = textNode.textContent || "";

      const transformations = {
        "->": "→",
        "<-": "←",
        "<- ": "← ",
        "-> ": "→ ",
        "=>": "⇒",
        "<=": "⇐",
        ">>": "»",
        "<<": "«",
        "!=": "≠",
        "---": "—",
        "(c)": "©",
        "(r)": "®",
        "(tm)": "™",
      };

      let newText = text;
      let newCursorOffset = cursorOffset;
      let changed = false;

      for (const [sequence, symbol] of Object.entries(transformations)) {
        const seqLen = sequence.length;
        if (cursorOffset >= seqLen) {
          const partToTest = text.substring(cursorOffset - seqLen, cursorOffset);
          if (partToTest === sequence) {
            newText = text.substring(0, cursorOffset - seqLen) + symbol + text.substring(cursorOffset);
            newCursorOffset = cursorOffset - seqLen + symbol.length;
            changed = true;
            break;
          }
        }
      }

      if (changed) {
        textNode.textContent = newText;
        try {
          const range = document.createRange();
          range.setStart(textNode, Math.min(newCursorOffset, newText.length));
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          console.error("Failed to restore cursor:", e);
        }
      }
    };

    editorElement.addEventListener("input", handleInput);
    return () => editorElement.removeEventListener("input", handleInput);
  }, [id]);

  useEffect(() => {
    if (!ejInstance.current) return;
    ejInstance.current.readOnly.toggle(isPageLocked);
  }, [isPageLocked]);

  // Export handlers
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const convertToMarkdown = (blocks) => {
    let markdown = "";
    blocks.forEach((block) => {
      switch (block.type) {
        case "header":
        case "headerH1": {
          const level = block.data.level || 1;
          const headerText = stripHtml(block.data.text || "");
          markdown += `${"#".repeat(level)} ${headerText}\n\n`;
          break;
        }
        case "paragraph": {
          const paragraphText = stripHtml(block.data.text || "");
          if (paragraphText.trim()) {
            markdown += `${paragraphText}\n\n`;
          }
          break;
        }
        case "list": {
          if (block.data.items && Array.isArray(block.data.items)) {
            block.data.items.forEach((item) => {
              const itemText = stripHtml(item.content || "");
              const prefix = block.data.style === "ordered" ? "1. " : "- ";
              markdown += `${prefix}${itemText}\n`;
            });
            markdown += "\n";
          }
          break;
        }
        case "code":
        case "jsCode": {
          const code = block.data.code || "";
          markdown += "```\n" + code + "\n```\n\n";
          break;
        }
        case "quote": {
          const quoteText = stripHtml(block.data.text || "");
          markdown += `> ${quoteText}\n\n`;
          break;
        }
        case "delimiter":
          markdown += "---\n\n";
          break;
        case "alert": {
          const alertMessage = stripHtml(block.data.message || "");
          const alertType = block.data.type || "info";
          markdown += `> **${alertType.toUpperCase()}**: ${alertMessage}\n\n`;
          break;
        }
        default:
          if (block.data && block.data.text) {
            const text = stripHtml(block.data.text);
            if (text.trim()) {
              markdown += `${text}\n\n`;
            }
          }
          break;
      }
    });
    return markdown;
  };

  const handleExportDS = () => {
    if (!content) return;
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName || "document"}.ds`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setShowExportDropdown(false);
  };

  const handleExportMarkdown = () => {
    if (!content || !content.blocks || content.blocks.length === 0) {
      alert("Nothing to export!");
      return;
    }
    const markdown = convertToMarkdown(content.blocks);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName || "document"}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setShowExportDropdown(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#ffffff",
        color: "#374151",
      }}
    >
      {isRefreshing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px 30px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid #f3f3f3",
                borderTop: "2px solid #6b1cff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span style={{ fontSize: "14px", color: "#333" }}>
              Refreshing content...
            </span>
          </div>
        </div>
      )}

      {/* Readdy Light Topbar */}
      <header className="readdy-light-topbar" style={{ contentEditable: "false", userSelect: "none" }}>
        <div className="topbar-left" style={{ display: 'flex', alignItems: 'center' }}>
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              fontSize: 12,
              color: '#9ca3af',
              overflow: 'visible',
              flexWrap: 'nowrap',
            }}
            aria-label="file path"
          >
            <i className="fa-solid fa-folder" style={{ marginRight: 6, fontSize: 11, opacity: 0.7, color: '#9ca3af' }}></i>
            {(breadcrumbs.length > 0
              ? breadcrumbs
              : [{ label: fileName, isFile: true }]
            ).map((seg, idx) => (
              <React.Fragment key={idx}>
                {!seg.isFile && (
                  <>
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#9ca3af',
                        cursor: 'default',
                      }}
                      title={seg.label}
                    >
                      {seg.label}
                    </span>
                    <span style={{ color: '#9ca3af', opacity: 0.5, margin: '0 4px', fontSize: 13, userSelect: 'none' }}>›</span>
                  </>
                )}
                {seg.isFile && (
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#111827',
                      cursor: 'default',
                    }}
                    title={seg.label}
                  >
                    {seg.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Export Dropdown */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "3px 12px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "3px",
                fontSize: "13px",
                color: "#374151",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              <i className="ri-download-2-line" style={{ marginRight: "6px", color: "#6b7280" }}></i>
              Export
              <i className="ri-arrow-down-s-line" style={{ marginLeft: "4px", color: "#6b7280" }}></i>
            </button>

            {showExportDropdown && (
              <div style={{
                position: "absolute",
                right: 0,
                marginTop: "6px",
                width: "192px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                border: "1px solid #E5E7EB",
                zIndex: 50
              }}>
                <div style={{ padding: "4px 0" }}>
                  <button
                    className="menu-item-light hover-bg-gray"
                    onClick={handleExportDS}
                    style={{ width: "100%", display: "flex", alignItems: "center", padding: "8px 16px", backgroundColor: "transparent", border: "none", fontSize: "13px", color: "#374151", cursor: "pointer", textAlign: "left" }}
                  >
                    <i className="ri-file-code-fill" style={{ marginRight: "10px", color: "#6b1cff" }}></i>
                    Devscribe (.ds)
                  </button>
                  <button
                    className="menu-item-light hover-bg-gray"
                    onClick={handleExportMarkdown}
                    style={{ width: "100%", display: "flex", alignItems: "center", padding: "8px 16px", backgroundColor: "transparent", border: "none", fontSize: "13px", color: "#374151", cursor: "pointer", textAlign: "left" }}
                  >
                    <i className="ri-markdown-fill" style={{ marginRight: "10px", color: "#0284c7" }}></i>
                    Markdown (.md)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Editor Scroller Frame */}
      <main
        className="notion-frame"
        style={{
          flexGrow: 1,
          flexShrink: 1,
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
          width: "100%",
          maxHeight: "100%",
          position: "relative",
          transitionProperty: "width",
          transitionDuration: "270ms",
          transitionTimingFunction: "ease",
          overflowY: "auto",
        }}
      >
        <div
          className="notion-scroller vertical"
          style={{
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            position: "relative",
            marginRight: "0px",
            marginBottom: "0px",
            overflowY: "hidden",
          }}
        >
          <div
            className="whenContentEditable"
            data-content-editable-root="true"
            style={{
              caretColor: "rgb(55, 53, 47)",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              flexGrow: 1,
            }}
          >
            <div
              id={`editorjs-${id}`}
              style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: "0",
                paddingTop: "30px",
                position: "relative",
              }}
            ></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorComponent;
