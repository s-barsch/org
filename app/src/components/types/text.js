import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Info } from '../meta';

const Text = ({file, moveFn, delFn, single}) => {
  const [body, setBody] = useState("");

  useEffect(() => {
    async function loadBody() {
      try {
        const resp = await fetch("/file" + file.path);
        const text = await resp.text();
        setBody(text);
      } catch(err) {
        alert(err)
      }
    }
    loadBody();
  }, [file]);

  const ref = useRef(null);

  useEffect(() => {
    if (single === true) {
      ref.current.focus({preventScroll:true});
    }
  }, [single]);

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

  let minRows = 1;

  if (single) {
    minRows = Math.round(window.screen.height/(2.25*16)) - 8;
  }

  return (
    <>
      { !single && <Info file={file} moveFn={moveFn} delFn={delFn} /> }
      <TextareaAutosize value={body}
      ref={ref}
      minRows={minRows}
      onChange={handleTyping}
      onBlur={submit} />
    </>
  )
}

export default Text;
