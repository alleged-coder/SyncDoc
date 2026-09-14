import React, { useEffect, useState, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import "./BlockEditor.css";

interface BlockNode {
  id: string;
  type: "paragraph" | "heading" | "code";
  content: string;
}

export const BlockEditor: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockNode[]>([]);

  // 1. State to track the number of active collaborators via Yjs Awareness
  const [activeUsers, setActiveUsers] = useState<number>(1);

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    // 2. Initialize the Yjs document
    const doc = new Y.Doc();
    ydocRef.current = doc;

    // 3. Connect to the WebSocket provider for real-time sync
    const provider = new WebsocketProvider(
      "wss://demos.yjs.dev/ws",
      "syncdoc-frontend-room-v2",
      doc,
    );
    providerRef.current = provider;

    // 4. Configure the Awareness protocol to track live users
    provider.awareness.setLocalStateField("user", {
      name: `User-${Math.floor(Math.random() * 1000)}`,
    });

    // Listen for changes in connected users and update state
    provider.awareness.on("change", () => {
      const size = provider.awareness.getStates().size;
      setActiveUsers(size);
    });

    // 5. Access the shared array of blocks
    const yarray = doc.getArray<BlockNode>("syncdoc-blocks");

    const updateStateFromYjs = () => {
      setBlocks(yarray.toArray());
    };

    // Listen for incoming changes from other users typing
    yarray.observe(updateStateFromYjs);

    // 6. Populate initial data if the document is empty on first load
    provider.on("sync", (isSynced: boolean) => {
      if (isSynced && yarray.length === 0) {
        yarray.insert(0, [
          {
            id: crypto.randomUUID(),
            type: "heading",
            content: "Technical Specification Document",
          },
          {
            id: crypto.randomUUID(),
            type: "paragraph",
            content: "Start typing your collaborative notes here...",
          },
        ]);
      } else {
        updateStateFromYjs();
      }
    });

    // Cleanup WebSocket connections when the component unmounts
    return () => {
      provider.disconnect();
      doc.destroy();
    };
  }, []);

  const updateBlockContent = (index: number, newContent: string) => {
    if (!ydocRef.current) return;
    const yarray = ydocRef.current.getArray<BlockNode>("syncdoc-blocks");
    const currentBlock = yarray.get(index);

    // Replace the old block with the updated content to sync across clients
    if (currentBlock) {
      yarray.delete(index, 1);
      yarray.insert(index, [{ ...currentBlock, content: newContent }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Create a new paragraph block dynamically when Enter is pressed
    if (e.key === "Enter" && ydocRef.current) {
      e.preventDefault();
      const yarray = ydocRef.current.getArray<BlockNode>("syncdoc-blocks");
      const newBlock: BlockNode = {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: "",
      };
      yarray.insert(index + 1, [newBlock]);
    }
  };

  return (
    <div className="editor-container">
      {/* Visual indicator showing live user count */}
      <div
        style={{
          textAlign: "right",
          color: "#10b981",
          fontSize: "0.875rem",
          fontWeight: "600",
          marginBottom: "1.5rem",
        }}
      >
        🟢 {activeUsers} {activeUsers === 1 ? "Editor" : "Editors"} Online
      </div>

      <div className="blocks-stack">
        {blocks.map((block, index) => (
          <div key={block.id || index} className="block-item">
            {block.type === "heading" ? (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlockContent(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="block-input-heading"
                placeholder="Heading..."
              />
            ) : (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlockContent(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="block-input-text"
                placeholder="Type your notes here..."
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
