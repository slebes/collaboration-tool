import { useState, useEffect, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { Button, Typography } from "@mui/material";

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
  toolbar: false
};

function TextEditor({initialValue, socket, closeEditor, filename, downloadFile, roomName }) {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState();
  const quillRef = useRef(null);

  // Create soccet connection
  useEffect(() => {
    // Listen to edit events
    socket.on(`edit-${filename}`, (delta) => {
      setValue((oldValue) => oldValue.compose(delta));
    });
    return () => {
      socket.off(`edit-${filename}`);
    };
  }, [socket, filename, roomName, initialValue]);

  const handleChange = (value, delta, source, editor) => {
    setValue(editor.getContents());
    socket?.connected &&
      source === "user" &&
      socket.emit("edit", { roomName, filename, delta });
  };

  const saveFile = () => {
    const text = quillRef.current.getEditor().getText();
    socket.emit("edit-save", { roomName, filename, value: text });
    // implement quill saving here
  };

  return (
    <div
      style={{ position: "absolute", top: "110px", backgroundColor: "white" }}
    >
      <Typography variant="h5">{filename}</Typography>
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
        style={{height: "80VH", width: "60VW"}}
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
