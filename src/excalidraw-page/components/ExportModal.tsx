import React, { useState } from "react";
import { createPortal } from "react-dom";
import { exportToBlob } from "@excalidraw/excalidraw";
import "./excalidraw-menu.css";

interface Props {
  excalidrawAPI: any;
  onClose: () => void;
}

const ExportModal: React.FC<Props> = ({ excalidrawAPI, onClose }) => {
  const [withBg, setWithBg] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [embedScene, setEmbedScene] = useState(false);
  const [scale, setScale] = useState(2);

  const exportImage = async (type: "png" | "svg") => {
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    const blob = await exportToBlob({
      elements,
      appState: {
        ...appState,
        exportBackground: withBg,
        exportWithDarkMode: darkMode,
        exportEmbedScene: embedScene,
        viewBackgroundColor: withBg
          ? appState.viewBackgroundColor
          : "transparent",
        theme: darkMode ? "dark" : "light",
      },
      files,
      mimeType: type === "png" ? "image/png" : "image/svg+xml",
      exportPadding: 10,
    });

    // In a desktop environment, invoke save process
    const buffer = Buffer.from(await blob.arrayBuffer());
    try {
      await window.require("electron").ipcRenderer.invoke("saveImage", {
        buffer,
        type,
      });
    } catch (e) {
      console.log(e);
      // Fallback for native web
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exported-image.${type}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    onClose();
  };

  const copyToClipboard = async () => {
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    const blob = await exportToBlob({
      elements,
      appState: {
        ...appState,
        exportBackground: withBg,
        exportWithDarkMode: darkMode,
        exportEmbedScene: embedScene,
        viewBackgroundColor: withBg
          ? appState.viewBackgroundColor
          : "transparent",
        theme: darkMode ? "dark" : "light",
      },
      files,
      mimeType: "image/png",
    });

    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    onClose();
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
      }}
    >
      <div
        className="Modal__background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
        onClick={onClose}
      />
      <div
        className="Modal__content dropdown-menu Island"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          width: "100%",
          maxWidth: "500px",
          padding: "24px",
          backgroundColor: "var(--island-bg-color, white)",
          borderRadius: "var(--border-radius-lg, 8px)",
          boxShadow: "var(--modal-shadow)",
          color: "var(--text-primary-color, black)",
          fontFamily: "var(--ui-font)",
          margin: "auto",
        }}
      >
        <div className="Dialog__content">
          <div className="ImageExportModal">
            <h3
              style={{
                marginTop: 0,
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "24px",
              }}
            >
              Export image
            </h3>

            <div
              className="ImageExportModal__settings"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                className="ImageExportModal__settings__setting"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label
                  htmlFor="exportBackgroundSwitch"
                  style={{ fontSize: "1rem", fontWeight: 500 }}
                >
                  Background
                </label>
                <div
                  className={`Switch ${withBg ? "toggled" : ""}`}
                  style={{
                    width: "36px",
                    height: "20px",
                    backgroundColor: withBg
                      ? "var(--color-primary, #6965db)"
                      : "var(--color-gray-30, #d6d6d6)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "2px",
                    transition: "all 0.2s",
                  }}
                  onClick={() => setWithBg(!withBg)}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      transform: withBg ? "translateX(16px)" : "translateX(0)",
                      transition: "transform 0.2s",
                    }}
                  />
                  <input
                    type="checkbox"
                    checked={withBg}
                    readOnly
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <div
                className="ImageExportModal__settings__setting"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label
                  htmlFor="exportDarkModeSwitch"
                  style={{ fontSize: "1rem", fontWeight: 500 }}
                >
                  Dark mode
                </label>
                <div
                  className={`Switch ${darkMode ? "toggled" : ""}`}
                  style={{
                    width: "36px",
                    height: "20px",
                    backgroundColor: darkMode
                      ? "var(--color-primary, #6965db)"
                      : "var(--color-gray-30, #d6d6d6)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "2px",
                    transition: "all 0.2s",
                  }}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      transform: darkMode
                        ? "translateX(16px)"
                        : "translateX(0)",
                      transition: "transform 0.2s",
                    }}
                  />
                  <input
                    type="checkbox"
                    checked={darkMode}
                    readOnly
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <div
                className="ImageExportModal__settings__setting"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label
                  htmlFor="exportEmbedSwitch"
                  style={{ fontSize: "1rem", fontWeight: 500 }}
                >
                  Embed scene
                </label>
                <div
                  className={`Switch ${embedScene ? "toggled" : ""}`}
                  style={{
                    width: "36px",
                    height: "20px",
                    backgroundColor: embedScene
                      ? "var(--color-primary, #6965db)"
                      : "var(--color-gray-30, #d6d6d6)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "2px",
                    transition: "all 0.2s",
                  }}
                  onClick={() => setEmbedScene(!embedScene)}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      transform: embedScene
                        ? "translateX(16px)"
                        : "translateX(0)",
                      transition: "transform 0.2s",
                    }}
                  />
                  <input
                    type="checkbox"
                    checked={embedScene}
                    readOnly
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <div
                className="ImageExportModal__settings__setting"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <label style={{ fontSize: "1rem", fontWeight: 500 }}>
                  Scale
                </label>
                <div
                  className="RadioGroup"
                  style={{
                    display: "flex",
                    backgroundColor: "var(--color-surface-low, #ececf4)",
                    borderRadius: "var(--border-radius-md, 6px)",
                    overflow: "hidden",
                    padding: "2px",
                  }}
                >
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`RadioGroup__choice ${
                        scale === s ? "active" : ""
                      }`}
                      style={{
                        padding: "4px 12px",
                        cursor: "pointer",
                        backgroundColor:
                          scale === s
                            ? "var(--color-primary, #6965db)"
                            : "transparent",
                        color:
                          scale === s
                            ? "white"
                            : "var(--text-primary-color, black)",
                        borderRadius: "4px",
                        transition: "all 0.1s",
                        fontWeight: scale === s ? 600 : 400,
                      }}
                      onClick={() => setScale(s)}
                    >
                      {s}×
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="ImageExportModal__settings__buttons"
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    backgroundColor: "var(--color-primary-light, #e3e2fe)",
                    color: "var(--color-primary, #6965db)",
                    border: "none",
                    borderRadius: "var(--border-radius-md, 6px)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => exportImage("png")}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
                    <path d="M7 11l5 5l5 -5"></path>
                    <path d="M12 4l0 12"></path>
                  </svg>
                  PNG
                </button>
                <button
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    backgroundColor: "var(--color-primary-light, #e3e2fe)",
                    color: "var(--color-primary, #6965db)",
                    border: "none",
                    borderRadius: "var(--border-radius-md, 6px)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => exportImage("svg")}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
                    <path d="M7 11l5 5l5 -5"></path>
                    <path d="M12 4l0 12"></path>
                  </svg>
                  SVG
                </button>
                <button
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    backgroundColor: "var(--color-surface-low, #ececf4)",
                    color: "var(--text-primary-color, black)",
                    border: "none",
                    borderRadius: "var(--border-radius-md, 6px)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={copyToClipboard}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
                    <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
                  </svg>
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ExportModal;
