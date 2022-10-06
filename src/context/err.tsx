import React, { createContext, useState } from 'react';

export type errObj = {
    path: string;
    func: string;
    code: number;
    msg:  string;
}

function newErr(): errObj {
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

function newErrProp(): errProp {
    return {
        err: newErr(),
        setErr: (err: errObj) => {}
    }
}

export const ErrContext = createContext<errProp>(newErrProp());
export default ErrProvider; 


function ErrProvider({ children }: {children: React.ReactNode}) {
    const [err, setErr] = useState(newErr());

    return (
        <ErrContext.Provider value={{ 
            err, setErr
        }}>
            {children}
        </ErrContext.Provider>
    );
}
