import File, { filesOnly } from '../funcs/files';
import { FileList } from '../views/search/list'

export default function All({files}: { files: File[] }){
    return (
        <section id="files">
        <FileList files={filesOnly(files)} />
        </section>
    );
}