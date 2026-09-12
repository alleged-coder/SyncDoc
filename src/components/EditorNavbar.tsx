import React from "react";
import "./EditorNavbar.css";

interface EditorNavbarProps {
  documentTitle: string;
  activeUsersCount: number;
}

export const EditorNavbar: React.FC<EditorNavbarProps> = ({
  documentTitle,
  activeUsersCount,
}) => {
  return (
    <header className="editor-navbar">
      <div className="navbar-left">
        <h1 className="document-title">{documentTitle}</h1>
        <span className="sync-badge">Live Synced</span>
      </div>
      <div className="navbar-right">
        <div className="collaborators-box">
          Active Collaborators:{" "}
          <span className="collaborators-count">{activeUsersCount}</span>
        </div>
      </div>
    </header>
  );
};
