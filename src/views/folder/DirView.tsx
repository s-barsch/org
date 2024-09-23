import Head from '../../parts/Head';
import File, { dirsOnly, filesOnly } from '../../funcs/files';
import { DirList, FileList } from '../../views/folder/parts/lists';
import { AddDir, AddText } from '../../views/folder/parts/AddDir';
import { HotKeys } from 'react-hotkeys';
import useView from '../../state';
import { Link, useNavigate } from 'react-router-dom';
import KineSelector from '../../parts/kine/Selector';
import { MyDropzone } from '../../parts/kine/Upload';
import { dirPath } from '../../funcs/paths';
import { join, basename } from 'path-browserify';

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
            <Head path={path} />
            { path == "/public/kine" && <KineSelector/>}
            <TranscriptLinks files={files} />
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

function TranscriptLinks({files}: {files: File[]}) {
    let mp4 = ""
    function transcriptPath(path: string, lang: string): string {
        const name = basename(path).slice(0, -4)
        return join(dirPath(path), "transcript", name + "." + lang + ".txt")
    }
    for (const f of files) {
        if (f.type === "video") {
            mp4 = f.path
        }
    }
    if (mp4 === "") {
        return null;
    }
    return(
        <>
        <Link to={transcriptPath(mp4, "de")}>de</Link>
        <Link to={transcriptPath(mp4, "en")}>en</Link>
        </>
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


