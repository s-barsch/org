import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Info from './info';

const Text = ({file, moveFn, delFn, single}) => {
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
