import React, { useState, useRef, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import LockIcon from "../../../components/icon/lock-icon";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

interface Props {
  excalidrawAPI: any;
  onExportClick: () => void;
  onLoad: () => void;
  onSaveJSON: () => void;
  onExportDS: () => void;
  onClear: () => void;
  onBackgroundChange: (color: string) => void;
}

const COLORS = ["#ffffff", "#f8f9fa", "#f5faff", "#fffce8", "#fdf8f6"];

const ExcalidrawMenu: React.FC<Props> = ({
  excalidrawAPI,
  onExportClick,
  onLoad,
  onSaveJSON,
  onExportDS,
  onClear,
  onBackgroundChange,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: any) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      {/* <button
        style={{
          display: "flex",
          alignItems: "center",
          padding: "5px 10px",
          borderRadius: "8px",
          fontSize: "0.875rem",
          color: "#374151",
          cursor: "pointer",
          backgroundColor: "#ececf4",
          border: "none",
          boxShadow: "0 0 0 1px #fff",
        }}
        onClick={() => setOpen(!open)}
      >
        <span style={{ marginTop: "3px" }}>
          <MenuIcon style={{ fontSize: "1.2rem" }} />
        </span>
      </button> */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "white",
          border: "0px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "0.875rem",
          color: "#374151",
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <span style={{ paddingRight: "5px", marginTop: "3px" }}>
          <LockIcon />
        </span>
        Options
        <ArrowDropDownIcon />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500">
              Canvas Options
            </div>

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              style={{
                display: "block",
                width: "100%",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: "0",
              }}
              onClick={() => {
                onLoad();
                setOpen(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <i className="fas fa-folder-open text-blue-500"></i>
              <span>Open</span>
            </button>

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              style={{
                display: "block",
                width: "100%",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: "0",
              }}
              onClick={() => {
                onSaveJSON();
                setOpen(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <i className="fas fa-save text-green-600"></i>
              <span>Save to...</span>
            </button>

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                margin: "auto",
                width: "85%",
                marginTop: 4,
                marginBottom: 4,
              }}
            />

            <div className="px-3 py-2 text-xs font-medium text-gray-500">
              Export Options
            </div>

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              style={{
                display: "block",
                width: "100%",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: "0",
              }}
              onClick={() => {
                onExportDS();
                setOpen(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <i className="fas fa-file-alt text-blue-600"></i>
              <span>Devscribe(.ds)</span>
            </button>

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              style={{
                display: "block",
                width: "100%",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: "0",
              }}
              onClick={() => {
                onExportClick();
                setOpen(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <i className="fas fa-image text-purple-600"></i>
              <span>Export Image</span>
            </button>

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                margin: "auto",
                width: "85%",
                marginTop: 4,
                marginBottom: 4,
              }}
            />

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 flex items-center space-x-2"
              style={{
                display: "block",
                width: "100%",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: "0",
                color: "#dc2626",
              }}
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fef2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <i className="fas fa-trash-alt"></i>
              <span>Clear Canvas</span>
            </button>

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                margin: "auto",
                width: "85%",
                marginTop: 4,
                marginBottom: 4,
              }}
            />

            <div className="px-3 py-2 text-xs font-medium text-gray-500">
              Canvas Background
            </div>
            <div className="px-4 py-2 flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "1px solid #d1d5db",
                    background: c,
                    cursor: "pointer",
                  }}
                  onClick={() => onBackgroundChange(c)}
                  title={`Background: ${c}`}
                />
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                margin: "auto",
                width: "85%",
                marginTop: 4,
                marginBottom: 4,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcalidrawMenu;
