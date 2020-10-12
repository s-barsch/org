import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Info } from '../meta';

const Text = ({file, modFuncs, single}) => {
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

  const submit = async () => {
    try {
      await fetch("/api/write" + file.path, {
        method: "POST",
        body:   body
      });
    } catch(err) {
      alert(err);
    }
  }

  return (
    <div className={"text" + (isNoSort(file.name) ? " no-sort" : "")}>
    { !single &&
      <Info file={file} modFuncs={modFuncs}/>
    }
      <TextareaAutosize value={body}
        ref={ref}
        minRows={!single ? 1 : fullScreenRows()}
        onChange={handleTyping}
        onBlur={submit} />
    </div>
  )
}

function isNoSort(name) {
  switch (name) {
    case "info":
    case ".sort":
      return true;
    default:
      return false;
  }
}

function fullScreenRows() {
  return Math.round(window.screen.height/(2.25*16)) - 8
}

export default Text;
