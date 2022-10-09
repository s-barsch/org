import React, { useState, useEffect } from 'react';
import { errObj } from 'context/err';

function StatusBox() {
    return <span className="errbox"></span>
}

export function ErrComponent({err}: {err: errObj}) {
    const [status, setStatus] = useState(err.code);
    let timeout: NodeJS.Timeout = setTimeout(() => {});

    useEffect(() => {
        return () => {
            clearTimeout(timeout)
        }
    }, [timeout]);

    if (err.code === 200) {
        timeout = setTimeout(() => {
            setStatus(0);
        }, 750);
    }

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
