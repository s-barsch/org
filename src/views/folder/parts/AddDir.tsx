import React, {useRef, useCallback, useState} from 'react';
import useView from '../../../state';

export function AddText({createFile}: {createFile: () => void}) {
    return <button className="add-text" onClick={createFile}>+ Text</button>
}

export function AddDir() {
    const [field, showField] = useState(false);
    const [fieldEl] = useHookWithRefCallback()

    function toggleField() {
        showField(!field);
    }

    if (field) {
        return <AddField fieldRef={fieldEl} toggleFn={toggleField} />
    }

    return <AddButton clickFn={toggleField} />
}

type AddFieldProps = {
    fieldRef: (node: any) => void;
    toggleFn: () => void;
}

function AddField({fieldRef, toggleFn}: AddFieldProps) {
    const [dirName, setDirName] = useState("");
    const { addNewDir } = useView();

    function handleTyping(e: React.FormEvent<HTMLInputElement>) {
        setDirName(e.currentTarget.value);
    }

    function handleBlur() {
        toggleFn();
        if (dirName === "") {
            return;
        }
        addNewDir(dirName);
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

// from here https://gist.github.com/thebuilder/fb07c989093d4a82811625de361884e7
function useHookWithRefCallback(): ((node: any) => void)[] {
    const ref = useRef(null)
    const setRef = useCallback((node: any) => {
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
