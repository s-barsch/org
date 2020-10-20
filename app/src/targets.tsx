import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as targets from './funcs/targets';

function TargetsProvider({ children }: {children: React.ReactNode}) {
    const defaultList: string[] = [];
    const [list, setList] = useState(defaultList);
    const [active, setActive] = useState("");

    const loadTargets = () => {
        setActive(targets.getActive());
        setList(targets.getList())
    }

    const listenForTargets = useCallback(evt => {
        loadTargets();
    }, []);

    useEffect(() => {
        window.addEventListener('storage', listenForTargets);

        return () => {
            window.removeEventListener('storage', listenForTargets);
        };
    }, [listenForTargets]);

    useEffect(() => {
        loadTargets();
    }, [])

    /* targets functions */

    function setActiveTarget(path: string) {
        targets.setActive(path);
        loadTargets();
    }

    function removeTarget(path: string) {
        targets.removeTarget(path);
        loadTargets();
    }

    let targetList = list
    let activeTarget = active

    return (
        <TargetsContext.Provider value={{ 
            targetList, activeTarget, removeTarget, setActiveTarget
        }}>
        {children}
        </TargetsContext.Provider>
    );
}

type ContextProps = {
    targetList: string[];
    activeTarget: string;
    removeTarget: (path: string) => void;
    setActiveTarget: (path: string) => void;
}

export const TargetsContext = createContext<Partial<ContextProps>>({});
export default TargetsProvider; 
