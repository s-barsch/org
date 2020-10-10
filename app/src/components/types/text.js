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

  const handleTyping = evt => {
    setBody(evt.target.value);
  }

  const submit = async evt => {
    try {
      await fetch("/api" + file.path, {
        method: "POST",
        body:   body
      });
    } catch(err) {
      alert(err);
    }
  }

  return (
    <>
    { !single &&
      <Info file={file} moveFn={moveFn} delFn={delFn} />
    }
      <TextareaAutosize value={body}
        ref={ref}
        minRows={single ? 1 : fullScreenRows()}
        onChange={handleTyping}
        onBlur={submit} />
    </>
  )
}

function fullScreenRows() {
  return Math.round(window.screen.height/(2.25*16)) - 8
}

export default Text;
