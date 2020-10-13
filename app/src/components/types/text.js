import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Info } from '../meta';

const Text = ({file, modFuncs, single}) => {
  const [body, setBody] = useState(file.body);

  useEffect(() => {
    setBody(file.body);
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

  const submit = () => {
    file.body = body;
    modFuncs.writeFile(file);
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
