//import { useNavigate } from 'react-router-dom';
//import Head from 'parts/head/main';
import File, { filesOnly } from '../../funcs/files';
import { FileList } from './list';
//import { dirname, join } from 'path-browserify';
import { monthObj } from '../Search';
import TimeChart from './chart';

export function SearchView({path, months, files}: {path: string, months: monthObj[], files: File[]}) {
    path = path;
    // const navigate = useNavigate();

    /*
    function renameSearch(newName: string) {
        let dir = dirname(path);
        if (path === '/search') {
            dir = path;
        }

        navigate(join(dir, newName));
    }
    */

    return (
        <>
            <code>Head navigation doesn’t work currently.</code>
            <TimeChart months={months} />
            <section id="files">
                <FileList files={filesOnly(files)} />
            </section>
        </>
    )
}
