import React, { createContext, useEffect, useCallback, useState } from 'react';
import Targets, { storeTargets, readTargets } from '../funcs/targets';

function TargetsProvider({ children }: {children: React.ReactNode}) {
    const [targets, setTargets] = useState(readTargets());

    useEffect(() => {
        setTargets(readTargets());
    }, []);

    function saveTargets(t: Targets) {
        setTargets({ ...t })
        storeTargets({ ...t });
    }

    /* watch localStorage for multi tab support */

    const listenForTargets = useCallback(evt => {
        setTargets(readTargets());
    }, []);

    useEffect(() => {
        window.addEventListener('storage', listenForTargets);

        return () => {
            window.removeEventListener('storage', listenForTargets);
        };
    }, [listenForTargets]);


    return (
        <TargetsContext.Provider value={{ 
            targets, saveTargets
        }}>
        {children}
        </TargetsContext.Provider>
    );
}

export type TargetsProps = {
    targets: Targets;
    saveTargets: (t: Targets) => void;
}

export const TargetsContext = createContext<TargetsProps>({} as TargetsProps);
export default TargetsProvider; 
