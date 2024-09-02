import Head from '../../parts/Head';
import File, { dirsOnly, filesOnly } from '../../funcs/files';
import { DirList, FileList } from '../../views/folder/parts/lists';
import { AddDir, AddText } from '../../views/folder/parts/AddDir';
import { HotKeys } from 'react-hotkeys';
import useView from '../../state';
import { useNavigate } from 'react-router-dom';
import KineSelector from '../../parts/kine/Selector';
import { MyDropzone } from '../../parts/kine/Upload';
import { AddButton } from './parts/AddButton';
import { useEffect, useRef, useState } from 'react';

type DirViewProps = {
    path: string;
    files: File[];
}


export default function DirView({path, files}: DirViewProps) {
    const navigate = useNavigate();
    const { createFilePath } = useView();

    function createFile() {
        navigate(createFilePath());
    }

    const keyMap = {
        NEW_TEXT: "ctrl+enter"
    };

    const handlers = {
        NEW_TEXT: createFile
    };

    return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
            <UploadProgress />
            <Head path={path} />
            { path == "/public/kine" && <KineSelector/>}
            <nav id="dirs">
                <DirList  dirs={dirsOnly(files)} />
                <AddDir />
            </nav>
            <section id="files">
                <AddText createFile={createFile} />
                { isKineFolder(path) && <MyDropzone isKine={true} name="File" /> }
                <KineButtons path={path} />
                <FileList files={filesOnly(files)} />
            </section>
        </HotKeys>
    )
}

export function UploadProgress() {
    const { uploadStatus, setUploadStatus, reloadView } = useView();
    const [isProcessing, setProcessing] = useState(false)
    const connection = useRef({} as WebSocket)

    useEffect(() => {
        const socket = new WebSocket("ws://"+window.location.host+"/api/kine/talk")
        socket.addEventListener("message", event => {
            setUploadStatus(event.data)
            if (event.data == "ENDED") {
                setProcessing(false);
                setTimeout(() => {
                    setUploadStatus('');
                }, 2000);
                reloadView();
                return;
            }
            setProcessing(true);
        });
        connection.current = socket;
    }, [])

    console.log(connection.current);
  
    function abort() {
        connection.current.send("STOP")
    }

    return (
        <div className='progress'>
            <div className='statusMessage'>{uploadStatus}</div>
            { isProcessing && <button onClick={abort} className='abort-button'>abort</button> }
        </div>
    )
}

export function KineButtons({path}: { path: string}) {
    if (!isKineFolder(path)) {
        return
    }
    return (
        <>
            {/*
            <AddButton name="Cover" />
            <AddButton name="Video" />
            <br/>
            <AddButton name="Trans De" />
            <AddButton name="Caption De" />
            <br />
            <AddButton name="Trans En" />
            <AddButton name="Caption En" />
            */}
        </>
    )
}

function isKineFolder(path: string): boolean {
    const kineRoot = '/public/kine'
    if (path.indexOf(kineRoot) < 0) {
        return false
    }
    const levels = path.substring(kineRoot.length).split('/')
    if (levels.length !== 4) {
        return false
    }
    if (levels[3] === 'bot') {
        return false
    }
    return true
}


