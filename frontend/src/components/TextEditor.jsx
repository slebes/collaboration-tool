import { useState, useEffect, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { Button } from "@mui/material";
import Delta from "quill-delta"

// Workaround for issue with inserting multiple whitespaces
// https://github.com/quilljs/quill/issues/1751#issuecomment-881294908
class PreserveWhiteSpace {
  constructor(quill) {
    quill.container.style.whiteSpace = "pre-line";
  }
}
Quill.register("modules/preserveWhiteSpace", PreserveWhiteSpace);
const modules = {
  preserveWhiteSpace: true,
};

function TextEditor({ socket, closeEditor, filename, downloadFile, roomName }) {
  const [value, setValue] = useState(new Delta());
  const [selection, setSelection] = useState(0);
  const quillRef = useRef(null);

  // Create soccet connection
  useEffect(() => {
    socket.emit("edit-start", { filename, roomName }, (fileEdits) => {
      console.log(fileEdits);
      setValue(new Delta(fileEdits));
    });
    // Listen to edit events
    socket.on("edit", (delta) => {
      setValue((oldValue) => oldValue.compose(delta));
    });
    return () => {
      socket.off("edit");
      socket.emit("edit-leave", { roomName, filename });
    };
  }, [socket, filename, roomName]);

  const handleChange = (value, delta, source, editor) => {
    setValue(editor.getContents());
    socket?.connected &&
      source === "user" &&
      socket.emit("edit", { roomName, filename, delta });
  };

  const saveFile = () => {
    console.log(value);
    const text = quillRef.current.getEditor().getText();
    socket.emit("edit-save", { roomName, filename, value: text });
    // implement quill saving here
  };

  return (
    <div
      style={{ position: "absolute", top: "110px", backgroundColor: "white" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Button onClick={closeEditor}>Close</Button>
        <Button onClick={saveFile}>Save</Button>
        <Button onClick={() => downloadFile(filename)}>Download</Button>
      </div>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleChange}
        modules={modules}
        selection={selection}
      />
    </div>
  );
}

export default TextEditor;
