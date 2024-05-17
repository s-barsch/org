import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function Today(){
    const navigate = useNavigate();
    useEffect(() => {
        async function todayRedirect() {
            const resp = await fetch("/api/today");
            const today = await resp.text();
            navigate(today);
        }
        todayRedirect();
    }, [navigate])
    return <></>;
}
