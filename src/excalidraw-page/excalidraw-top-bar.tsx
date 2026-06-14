import React, { useState } from "react";
import moment from "moment";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { ContentItem, FileType } from "../../interface";
import { useSidebarContext } from "../../context/SidebarContext";
import { useFilesContext } from "../../context/FilesContext";
import Popup from "../../components/common/popup";

import ExcalidrawMenu from "./components/ExcalidrawMenu";
import ExportModal from "./components/ExportModal";
import { serializeAsJSON } from "@excalidraw/excalidraw";

const { ipcRenderer } = window.require("electron");

interface Props {
  fileId: string;
  fileName: string;
  lastEdited: string;
  isLastEdited?: boolean;
  content?: ContentItem;
  excalidrawAPI: any;
}

const ExcalidrawTopBar: React.FC<Props> = ({
  fileId,
  fileName,
  lastEdited,
  isLastEdited,
  excalidrawAPI,
  content,
}) => {
  const { sidebarVisible } = useSidebarContext();
  const { refreshFiles } = useFilesContext();

  const [showFilePopup, setShowFilePopup] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // ------------------- ACTIONS -------------------

  const handleUpdateFile = async (name: string) => {
    try {
      await ipcRenderer.invoke("updateFileName", { fileId, name });
      await refreshFiles();
      setShowFilePopup(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLoad = async () => {
    if (!excalidrawAPI) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".excalidraw,.json";

    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.type === "excalidraw") {
          excalidrawAPI.updateScene({
            elements: data.elements,
            appState: data.appState,
            files: data.files,
          });
        } else {
          alert("Invalid Excalidraw file format.");
        }
      } catch (err) {
        console.error("Failed to load Excalidraw file", err);
        alert("Error loading file. Check console for details.");
      }
    };

    input.click();
  };

  const handleExportJSON = async () => {
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    const exportData = {
      ...content,
      fileType: FileType.EXCALIDRAW,
      blocks: [
        {
          type: "excalidraw",
          data: {
            elements: elements,
            appState: appState,
            files: files,
          },
        },
      ],
    };

    const finalJson = JSON.stringify(exportData, null, 2);
    const blob = new Blob([finalJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName || "untitled"}.excalidraw`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportDS = async () => {
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    const exportData = {
      ...content,
      fileType: FileType.EXCALIDRAW,
      blocks: [
        {
          type: "excalidraw",
          data: {
            elements: elements,
            appState: appState,
            files: files,
          },
        },
      ],
    };

    const finalJson = JSON.stringify(exportData, null, 2);
    const blob = new Blob([finalJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName || "untitled"}.ds`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (!excalidrawAPI) return;
    excalidrawAPI.updateScene({ elements: [] });
  };

  const handleBackground = (color: string) => {
    if (!excalidrawAPI) return;

    const appState = excalidrawAPI.getAppState();

    excalidrawAPI.updateScene({
      appState: {
        ...appState,
        viewBackgroundColor: color,
      },
    });
  };

  // ------------------- UI -------------------

  return (
    <header
      style={{
        background: "white",
        maxWidth: "97vw",
        zIndex: 100,
        userSelect: "none",
        borderBottom: "1px solid rgb(229 231 235)",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        padding: "1rem",
        paddingLeft: sidebarVisible ? "1rem" : "calc(1rem + 45px)",
        marginLeft: sidebarVisible ? "0px" : "0px",
        transition:
          "padding-left 0.5s ease, margin-left 0.5s ease, all 0.5s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
          height: "32px",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: sidebarVisible ? "0px" : "45px",
            transition: "margin-left 0.3s",
          }}
        >
          {/* FILE NAME */}
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#1f2937",
              margin: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            {fileName}
            <button
              style={{
                marginLeft: "12px",
                background: "transparent",
                border: "none",
                width: "25px",
                height: "25px",
                cursor: "pointer",
              }}
              onClick={() => setShowFilePopup(true)}
            >
              <i className="fa-solid fa-pen"></i>
            </button>
          </h1>

          {/* LAST EDITED */}
          {isLastEdited && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "16px",
                color: "#6b7280",
                fontSize: "0.875rem",
              }}
            >
              <AccessTimeFilledIcon
                style={{ fontSize: "0.98rem", paddingRight: "2px" }}
              />
              <span>Last edited {moment(lastEdited).fromNow()}</span>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* MENU */}
          <ExcalidrawMenu
            excalidrawAPI={excalidrawAPI}
            onExportClick={() => setShowExportModal(true)}
            onLoad={handleLoad}
            onSaveJSON={handleExportJSON}
            onExportDS={handleExportDS}
            onClear={handleClear}
            onBackgroundChange={handleBackground}
          />
        </div>
      </div>

      {/* RENAME POPUP */}
      <Popup
        type="file"
        isOpen={showFilePopup}
        onClose={() => setShowFilePopup(false)}
        onSubmit={handleUpdateFile}
        title="Rename File"
        inputLabel="File Name"
        initialValue={fileName}
        inputPlaceholder="Enter file name"
        submitButtonText="Update"
        cancelButtonText="Cancel"
        defaultFileType={FileType.EXCALIDRAW}
      />

      {/* EXPORT MODAL */}
      {showExportModal && (
        <ExportModal
          excalidrawAPI={excalidrawAPI}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </header>
  );
};

export default ExcalidrawTopBar;
