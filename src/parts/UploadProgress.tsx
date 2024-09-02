import { useEffect, useState } from "react";
import useView from "../state";
import useWebSocket from "react-use-websocket";

export function SocketURL() {
    return "ws://"+window.location.host+"/api/kine/talk"
}

export function UploadProgress() {
    const { uploadStatus, setUploadStatus, reloadView } = useView();
    const [isProcessing, setProcessing] = useState(false)

    const { sendMessage, lastMessage } = useWebSocket(
        SocketURL(),
        {
          share: true,
          shouldReconnect: () => true,
        },
      )

    useEffect(() => {
        if (lastMessage === null) {
            return
        }
        setUploadStatus(lastMessage.data)
        if (lastMessage.data == "ENDED") {
            setProcessing(false);
            setTimeout(() => {
                setUploadStatus('');
            }, 2000);
            reloadView();
            return;
        }
        setProcessing(true);
    }, [lastMessage])

    function abort() {
        sendMessage("STOP")
    }

    return (
        <div className='progress'>
            <div className='statusMessage'>{uploadStatus}</div>
            { isProcessing && <button onClick={abort} className='abort-button'>abort</button> }
        </div>
    )
}