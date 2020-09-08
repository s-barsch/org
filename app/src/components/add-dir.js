import React, {useRef, useCallback, useState} from 'react';

const AddDir = ({submitFn}) => {
  const [field, showField] = useState(false);

  const [fieldEl] = useHookWithRefCallback()

  const toggleField = () => {
    showField(!field);
  }

  return (
    <span className="add-dir">
      { !field && <AddButton clickFn={toggleField} /> }
      { field  && <AddField fieldRef={fieldEl} submitFn={submitFn} toggleFn={toggleField} /> }
    </span>
  )
}

const AddField = ({fieldRef, submitFn, toggleFn}) => {
  const [dirName, setDirName] = useState("");

  const handleTyping = ev => {
    setDirName(ev.target.value);
  }

  const handleBlur = ev => {
    submitFn(dirName);
    toggleFn();
  }

  return (
    <input ref={fieldRef} value={dirName} onChange={handleTyping} onBlur={handleBlur} />
  )
}

const AddButton = ({clickFn}) => {
  return (
    <button onClick={clickFn}>+</button>
  )
}

export default AddDir;

// from here https://gist.github.com/thebuilder/fb07c989093d4a82811625de361884e7
function useHookWithRefCallback() {
  const ref = useRef(null)
  const setRef = useCallback(node => {
    if (ref.current) {
      // Make sure to cleanup any events/references added to the last instance
    }
    
    if (node) {
      node.focus();
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
    }
    
    // Save a reference to the node
    ref.current = node
  }, [])
  
  return [setRef]
}
