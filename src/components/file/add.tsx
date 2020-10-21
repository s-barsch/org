import React, {useRef, useCallback, useState} from 'react';

type AddDirProps = {
    submitFn: (name: string) => void;
}

function AddDir({submitFn}: AddDirProps) {
    const [field, showField] = useState(false);
    const [fieldEl] = useHookWithRefCallback()

    function toggleField() {
        showField(!field);
    }

    if (field) {
        return <AddField fieldRef={fieldEl} submitFn={submitFn} toggleFn={toggleField} />
    }

    return <AddButton clickFn={toggleField} />
}

type AddFieldProps = {
    fieldRef: (node: any) => void;
    submitFn: (name: string) => void;
    toggleFn: () => void;
}

function AddField({fieldRef, submitFn, toggleFn}: AddFieldProps) {
    const [dirName, setDirName] = useState("");

    function handleTyping(e: React.FormEvent<HTMLInputElement>) {
        setDirName(e.currentTarget.value);
    }

    function handleBlur() {
        submitFn(dirName);
        toggleFn();
    }

    return (
        <input ref={fieldRef} value={dirName} onChange={handleTyping} onBlur={handleBlur} />
    )
}

const AddButton = ({clickFn}: {clickFn: () => void}) => {
    return (
        <button className="add-dir" onClick={clickFn}>+</button>
    )
}

export default AddDir;

// from here https://gist.github.com/thebuilder/fb07c989093d4a82811625de361884e7
function useHookWithRefCallback(): ((node: any) => void)[] {
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
