import React, { useState, useEffect} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Info from './info';

const Text = ({file, delFn}) => {
  const [body, setBody] = useState("");

  useEffect(() => {
    fetch("/api" + file.path).then(
      resp => resp.text().then(
        textContent => setBody(textContent)
      )
    );
  }, [file]);

  const handleTyping = event => {
    setBody(event.target.value);
  }

  const submit = event => {
    fetch("/api" + file.path, {
      method: "POST",
      body:   body
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  return (
    <>
      <Info file={file} delFn={delFn} />
      <TextareaAutosize value={body}
      onChange={handleTyping}
      onBlur={submit} />
    </>
  )
}

export default Text;
