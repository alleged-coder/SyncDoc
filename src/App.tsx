import { EditorNavbar } from "./components/EditorNavbar";
import { BlockEditor } from "./components/BlockEditor";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <EditorNavbar
        documentTitle="System Architecture Spec.md"
        activeUsersCount={1}
      />
      <main style={{ flex: 1 }}>
        <BlockEditor />
      </main>
    </div>
  );
}

export default App;
