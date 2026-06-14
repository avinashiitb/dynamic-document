import React, { useEffect, useState, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useParams } from "react-router-dom";
import { useFilesContext } from "../../context/FilesContext";
import { useContentContext } from "../../context/ContentContext";
import ExcalidrawTopBar from "./excalidraw-top-bar";

const { ipcRenderer } = window.require("electron");

const ExcalidrawPage: React.FC = () => {
  const { content, setContent } = useContentContext();
  const { id } = useParams();
  const { files } = useFilesContext();

  const [isLoaded, setIsLoaded] = useState(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const isSaving = useRef(false);

  // -------------------- SAFE HELPERS --------------------

  const sanitizeAppState = (appState: any) => {
    if (!appState) return {};

    return {
      ...appState,
      collaborators: undefined, // ❌ remove Map
      selectedElementIds: appState.selectedElementIds || {},
      editingGroupId: null,
      editingLinearElement: null,
    };
  };

  const restoreAppState = (appState: any = {}) => {
    return {
      ...appState,
      collaborators: new Map(), // ✅ FIX crash
      selectedElementIds: appState?.selectedElementIds || {},
      isLoading: false,
    };
  };

  // -------------------- LOAD --------------------

  useEffect(() => {
    if (!id) return;
    setIsLoaded(false);

    ipcRenderer.invoke("getDocumentsByParentFile", id).then((doc) => {
      const data = Array.isArray(doc) && doc.length > 0 ? doc[0] : null;
      setContent(data);
      setIsLoaded(true);
    });
  }, [id]);

  // -------------------- AUTO SAVE --------------------

  useEffect(() => {
    if (!id || !isLoaded || !excalidrawAPI) return;

    const interval = setInterval(async () => {
      if (isSaving.current) return;

      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      if (!elements || elements.length === 0) return;

      await saveExcalidrawToDatabase({
        elements,
        appState: sanitizeAppState(appState), // ✅ SAFE SAVE
        files,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [id, isLoaded, excalidrawAPI]);

  // -------------------- SAVE --------------------

  const saveExcalidrawToDatabase = async (sceneData: any) => {
    if (isSaving.current) return;
    isSaving.current = true;

    try {
      const updatedContents: any = {
        version: "2.28.2",
        time: Date.now(),
        blocks: [{ type: "excalidraw", data: sceneData }],
        parent_file: id,
        _id: content?._id,
      };

      await ipcRenderer.invoke("updateDocument", {
        parent_file: id,
        content: [updatedContents],
      });
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      isSaving.current = false;
    }
  };

  // -------------------- FILE INFO --------------------

  const getFileName = () => {
    const file = files.find((f) => f._id === id);
    return file?.title || "Untitled";
  };

  const lastEdited = () => {
    const file = files.find((f) => f._id === id);
    return file?.updatedAt || new Date().getTime().toString();
  };

  // -------------------- INITIAL DATA --------------------

  const initialDataRaw = content?.blocks?.[0]?.data || null;

  const initialData = {
    elements: initialDataRaw?.elements || [],
    appState: restoreAppState(initialDataRaw?.appState || {}), // ✅ SAFE RESTORE
    files: initialDataRaw?.files || {},
  };

  // -------------------- UI --------------------

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <ExcalidrawTopBar
        fileId={id as string}
        fileName={getFileName()}
        lastEdited={lastEdited()}
        isLastEdited={true}
        content={content}
        excalidrawAPI={excalidrawAPI}
      />

      <main
        className="notion-frame bg-gray-100"
        style={{
          height: "calc(100vh - 62px)",
        }}
      >
        {isLoaded && (
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={initialData}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveToActiveFile: false,
                export: false,
                saveAsImage: false,
                clearCanvas: false,
                changeViewBackgroundColor: false,
                toggleTheme: false,
              },
            }}
          />
        )}
      </main>
    </div>
  );
};

export default ExcalidrawPage;
