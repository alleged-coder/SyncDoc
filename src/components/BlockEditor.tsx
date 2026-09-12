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
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    ydocRef.current = doc;

    const provider = new WebsocketProvider(
      "wss://demos.yjs.dev/ws",
      "syncdoc-frontend-room-v2",
      doc,
    );
    providerRef.current = provider;

    const yarray = doc.getArray<BlockNode>("syncdoc-blocks");

    const updateStateFromYjs = () => {
      setBlocks(yarray.toArray());
    };

    yarray.observe(updateStateFromYjs);

    provider.on("sync", (isSynced: boolean) => {
      if (isSynced && yarray.length === 0) {
        yarray.insert(0, [
          {
            id: "1",
            type: "heading",
            content: "Technical Specification Document",
          },
          {
            id: "2",
            type: "paragraph",
            content: "Start typing your collaborative notes here...",
          },
        ]);
      } else {
        updateStateFromYjs();
      }
    });

    return () => {
      provider.disconnect();
      doc.destroy();
    };
  }, []);

  const updateBlockContent = (index: number, newContent: string) => {
    if (!ydocRef.current) return;
    const yarray = ydocRef.current.getArray<BlockNode>("syncdoc-blocks");
    const currentBlock = yarray.get(index);
    if (currentBlock) {
      yarray.delete(index, 1);
      yarray.insert(index, [{ ...currentBlock, content: newContent }]);
    }
  };

  return (
    <div className="editor-container">
      <div className="blocks-stack">
        {blocks.map((block, index) => (
          <div key={block.id || index} className="block-item">
            {block.type === "heading" ? (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlockContent(index, e.target.value)}
                className="block-input-heading"
              />
            ) : (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlockContent(index, e.target.value)}
                className="block-input-text"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
