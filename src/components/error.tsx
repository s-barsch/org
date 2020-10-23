import React from 'react';
import { errObj } from 'app';

function ErrComponent({err}: {err: errObj}) {
    return (
        <>{err.msg}</>
    )
}
