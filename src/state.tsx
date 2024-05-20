import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import File, { renameText, updateFile } from 'funcs/files';
import type {} from '@redux-devtools/extension'
import { basename, dirname, join } from 'path-browserify';
import { moveRequest, saveSortRequest, writeRequest } from 'funcs/requests';
import { isDir, isText } from 'funcs/paths';
import { errObj } from 'context/err';

interface ViewState {
  view: viewObject;
  status: string;
  setView: (v: viewObject) => void
  setDir: (dir: dirContent) => void;
  renameView: (newName: string) => void;
  update: (newFiles: File[], isSorted: boolean) => void;
  writeFile: (f: File) => void;
}

function setErr(err: errObj) {
    if (err.code !== 200) {
        alert(JSON.stringify(err));
    }
}

const useView = create<ViewState>()(
  devtools(
    persist(
      (set, get) => ({
        view: newView(),
        status: "",
        setDir: (dir: dirContent) => {
            let v = get().view;
            v.dir = dir;
            set({ view: v });
        },
        update: (newFiles, isSorted) => {
            get().setDir({
                sorted: isSorted,
                files:  newFiles
            })
            const path = get().view.path
            if (isSorted && isDir(path)) {
                saveSortRequest(path, newFiles, setErr)
            }
        },
        setView: (v: viewObject) => {set( {view: v})},
        renameView: async (newName) => {
            const path = get().view.path;
            let oldName = basename(path);
            let newPath = join(dirname(path), newName);
    
            await moveRequest(path, newPath, setErr);
    
            const d = get().view.dir;
            if (isText(path)) {
                const newFiles = renameText(d.files.slice(), oldName, newName)
                get().update(newFiles, d.sorted);
            }
        },
        writeFile: async (f: File) => {
          const d = get().view.dir;
          await writeRequest(f.path, f.body, setErr);
          get().update(updateFile(d.files.slice(), f, d.sorted), d.sorted)
      },

        addNewDir: () => {},
      }),
      {
        name: 'dir-state',
      },
    ),
  ),
)

export default useView;

export type viewObject = {
    path: string;
    dir: dirContent;
}

export type dirContent = {
    files:  File[];
    sorted: boolean;
}

export function newView(): viewObject {
    return {
        path: "",
        dir: { files: [], sorted: false },
    };
}


