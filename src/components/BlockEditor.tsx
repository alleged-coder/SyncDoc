import React, { useState } from "react";
import "./BlockEditor.css";

interface BlockNode {
  id: string;
  type: "paragraph" | "heading" | "code";
  content: string;
}

export const BlockEditor: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockNode[]>([
    { id: "1", type: "heading", content: "Technical Specification Document" },
    {
      id: "2",
      type: "paragraph",
      content: "Start typing your structural nodes here...",
    },
  ]);

  const updateBlockContent = (index: number, newContent: string) => {
    const updated = [...blocks];
    updated[index].content = newContent;
    setBlocks(updated);
  };

  return (
    <div className="editor-container">
      <div className="blocks-stack">
        {blocks.map((block, index) => (
          <div key={block.id} className="block-item">
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
