import React, { useState, useEffect } from 'react';
import { errObj } from 'context/err';

function StatusBox() {
    return <span className="errbox"></span>
}

export function ErrComponent({err}: {err: errObj}) {
    const [status, setStatus] = useState(err.code);

    useEffect(() => {
        let timer: NodeJS.Timeout = setTimeout(() => { });

        if (err.code === 200) {
            timer = setTimeout(() => {
                setStatus(0);
            }, 750);
        }

        return () => {
            clearTimeout(timer)
        }
    }, [err]);

    switch (status) {
        case 0:
            return null
        case 200:
            return <span className="success"><StatusBox /></span>
        default:
            return (
                <span className="fail">
                    <span className="err">{err.msg}</span><StatusBox/>
                </span>
            )
    }
}
