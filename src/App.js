import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import './readdy.css';
import EditorComponent from './components/editor-js';

function App() {
  const isPreview = useMemo(() => {
    try {
      const url = new URL(window.location.href);
      let p = url.searchParams.get("preview");
      if (!p && window.location.hash.includes("?")) {
        const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
        p = hashParams.get("preview");
      }
      return p === "true";
    } catch (e) {
      return false;
    }
  }, []);

  // Scrape FileId aggressively from any electron-router bounds
  const getFileId = () => {
    let id = window.pluginAPI?.context?.fileId;
    if (id) return id;

    // Fallback URL parsing
    try {
      const url = new URL(window.location.href);
      id = url.searchParams.get("fileId");
      if (!id && window.location.hash.includes("?")) {
        const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
        id = hashParams.get("fileId");
      }
    } catch (e) { }
    return id;
  };

  const fileId = getFileId() || "web-test-document";

  if (!fileId && !isPreview) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#9ca3af' }}>
        <h3>No Document Selected</h3>
      </div>
    );
  }

  return (
    <div className="App">
      <EditorComponent fileId={fileId} isPreview={isPreview} />
    </div>
  );
}

export default App;
