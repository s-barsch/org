import All from '../views/All';
import { fileType } from '../funcs/paths';
import File from '../funcs/files';
import TextView from '../views/folder/TextView';
import DirView from '../views/folder/DirView';
import MediaView from './folder/MediaView';

type ViewProps = {
    path: string;
    files: File[];
    sorted: boolean;
}

export default function View({path, files }: ViewProps) {
    // let { setErr } = useContext(ErrContext);
    switch (fileType(path)) {
        case "text":
            return <TextView path={path} files={files} />;
        case "media":
            return <MediaView path={path} files={files} />;
        case "all":
            return <All files={files} />;
        default:
            return <DirView path={path} files={files} />
    }
}