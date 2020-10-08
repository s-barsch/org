import React, { useState, useEffect} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Info from './info';

const Text = ({file, moveFn, delFn}) => {
  const [body, setBody] = useState("");

  useEffect(() => {
    fetch("/file" + file.path).then(
      resp => resp.text().then(
        textContent => {
          setBody(textContent);
        }
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
      <Info file={file} moveFn={moveFn} delFn={delFn} />
      <TextareaAutosize value={body}
      onChange={handleTyping}
      onBlur={submit} />
    </>
  )
}

export default Text;
