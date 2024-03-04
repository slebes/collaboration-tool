import { useState, useEffect, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { Button } from '@mui/material';

// Workaround for issue with inserting multiple whitespaces
// https://github.com/quilljs/quill/issues/1751#issuecomment-881294908
class PreserveWhiteSpace {
  constructor(quill) {
    quill.container.style.whiteSpace = "pre-line";
  }
}
Quill.register('modules/preserveWhiteSpace', PreserveWhiteSpace);
const modules = {
  preserveWhiteSpace: true
}

function TextEditor({socket, closeEditor, filename, downloadFile}) {
  const [value, setValue] = useState('');
  const [newDelta, setNewDelta] = useState(null)
  const [selection, setSelection] = useState(0)
  const quillRef = useRef(null)

  // Create soccet connection
  useEffect(() => {
    // Listen to edit events
    socket.on("edit", (delta) => {
      setNewDelta(delta)
    })
    socket.on("edit-start", (delta) => {
      console.log("start edit")
      setValue(delta)
    })
    socket.emit("edit-start")
    return () => {
      socket.off("edit")
      socket.off("edit-start")
    }
  }, [socket])

  useEffect(() => {
    if(quillRef.current !== null && newDelta !== null) {
      setValue(newDelta)
    }
  }, [newDelta])
  
  function handleChange(value, delta, source, editor) {
    setValue(editor.getContents())
    socket?.connected && source === "user" && socket.emit("edit", delta )
  }

  return (
    <div style={{position: 'absolute', top:'110px', backgroundColor: 'white'}}>
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
        <Button onClick={closeEditor}>Close</Button>
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

export default TextEditor