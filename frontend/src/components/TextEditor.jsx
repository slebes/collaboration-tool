import { useState, useEffect, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import socketIO from 'socket.io-client';

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

function TextEditor() {

  const [value, setValue] = useState('');
  const [socket, setSocket] = useState(null);
  const [newDelta, setNewDelta] = useState(null)
  const [selection, setSelection] = useState(0)
  const quillRef = useRef(null)

  // Create soccet connection
  useEffect(() => {
    const newSocket = socketIO.connect("https://localhost:4000");
    // Listen to edit events
    newSocket.on("edit", (data) => {
      setNewDelta(JSON.parse(data).delta)
    })
    
    setSocket(newSocket)

    return () => {
      newSocket.disconnect();
    }
  }, [])

  useEffect(() => {
    if(quillRef.current !== null && newDelta !== null) {
      const combined = quillRef.current.unprivilegedEditor.getContents().compose(newDelta)
      setValue(combined)
    }
  }, [newDelta])
  
  function handleChange(value, delta, source, editor) {
    source === "user" && setSelection(editor.getSelection())
    socket?.connected && source === "user" && socket.emit("edit", JSON.stringify({ delta: delta }))
  }

  return (
    <ReactQuill
      ref={quillRef}
      value={value}
      onChange={handleChange}
      modules={modules}
      selection={selection}
    />
  );
}

export default TextEditor