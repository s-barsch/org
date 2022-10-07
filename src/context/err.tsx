import React, { createContext, useState } from 'react';

export type errObj = {
    path: string;
    func: string;
    code: number;
    msg:  string;
}

export function newErr(): errObj {
    return {
        path: "",
        func: "",
        code: 0,
        msg:  ""
    }
}

export type errProp = {
    err: errObj;
    setErr: (err: errObj) => void;
}

export const ErrContext = createContext<errProp>({} as errProp);

export default function ErrProvider({ children }: {children: React.ReactNode}) {
    const [err, setErr] = useState(newErr());

    return (
        <ErrContext.Provider value={{ err, setErr }}>
            {children}
        </ErrContext.Provider>
    );
}
