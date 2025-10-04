import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import File, { createDuplicate, insertDuplicateFile, insertNewDir, isPresent, merge, removeFromArr, renameText, updateFile } from './funcs/files';
import { basename, dirname, join } from 'path-browserify';
import { deleteRequest, moveRequest, newDirRequest, saveSortRequest, writeRequest } from './funcs/requests';
import { isDir, isText } from './funcs/paths';
import { errObj } from './context/err';
import { orgSort } from './funcs/sort';
import { newFilePath } from './funcs';

interface ViewState {
  view: viewObject;
  status: string;
  uploadStatus: string;
  setUploadStatus: (msg: string) => void;
  setView: (v: viewObject) => void
  loadView: (path: string) => void;
  reloadView: () => void;
  setDir: (dir: dirContent) => void;
  renameView: (oldPath: string, newName: string) => void;
  update: (newFiles: File[], isSorted: boolean) => void;
  addNewDir: (name: string) => void;
  writeFile: (f: File) => void;
  renameFile: (oldPath: string, f: File) => void;
  duplicateFile: (f: File) => void;
  deleteFile: (f: File) => void;
  saveSort: (part: File[], type: string) => void;
  moveFile: (f: File, newPath: string) => void;
  createFilePath: () => string;
}

function setErr(err: errObj) {
    if (err.code !== 200) {
        alert(JSON.stringify(err));
    }
}

const useView = create<ViewState>()(
  devtools(
      (set, get) => ({
        view: newView(),
        status: "",
        uploadStatus: "",
        setUploadStatus: (msg: string) => {
          set({uploadStatus: msg});
        },
        loadView: async (path: string) => {
          const resp = await fetch("/api/view" + path);
          if (!resp.ok) {
            set({ status: resp.status + " - " + resp.statusText})
          }
          set({ view: await resp.json() });
        },
        reloadView: () => {
          get().loadView(get().view.path)
        },
        setDir: (dir: dirContent) => {
          let v = get().view;
          v.dir = dir;
          set({ view: v });
        },
        update: (newFiles, isSorted) => {
          get().setDir({
            sorted: isSorted,
            files: newFiles
          })
          const path = get().view.path
          if (isSorted && isDir(path)) {
            saveSortRequest(path, newFiles, setErr)
          }
        },
        setView: (v: viewObject) => { set({ view: v }) },
        // text, media, dir
        renameView: async (oldPath, newName) => {
          let oldName = basename(oldPath);
          let newPath = join(dirname(oldPath), newName);

          await moveRequest(oldPath, newPath, setErr);

          const d = get().view.dir;
          if (isText(newName)) {
            const newFiles = renameText(d.files.slice(), oldName, newName)
            get().update(newFiles, d.sorted);
          }
        },
        writeFile: async (f: File) => {
          const d = get().view.dir;
          await writeRequest(f.path, f.body, setErr);
          get().update(updateFile(d.files.slice(), f, d.sorted), d.sorted)
        },
        // meta
        duplicateFile: async (f: File) => {
          const v = get().view;
          let newF: File;
          try {
            newF = createDuplicate(f, v.dir.files);
          } catch (err) {
            alert(err);
            return;
          }
          await writeRequest(newF.path, newF.body, setErr);

          const newFiles = insertDuplicateFile(v.dir.files.slice(), f, newF, v.dir.sorted)
          get().update(newFiles, v.dir.sorted);
        },
        // meta, nav
        deleteFile: async (f: File) => {
          const v = get().view;
          let isSorted = v.dir.sorted;
          if (f.name === ".sort") {
            isSorted = false;
          }
          await deleteRequest(f.path, setErr);
          get().update(removeFromArr(v.dir.files.slice(), f.name), isSorted);
        },
        addNewDir: async (name: string) => {
          const v = get().view;
          if (isPresent(v.dir.files, name)) {
            alert("Dir with this name already exists.");
            return;
          }
          const dirPath = join(v.path, name);

          await newDirRequest(dirPath, setErr)
          get().update(insertNewDir(v.dir.files.slice(), dirPath, v.dir.sorted), v.dir.sorted)
        },
        // meta
        renameFile: async (oldPath: string, f: File) => {
          const v = get().view
          let newFiles = v.dir.files.slice()
          if (!v.dir.sorted) {
            newFiles = orgSort(newFiles)
          }
          await moveRequest(oldPath, f.path, setErr);
          get().update(newFiles, v.dir.sorted);
        },
        // list view
        saveSort: async (part: File[], type: string) => {
          const v = get().view;
          const newFiles = merge(v.dir.files.slice(), part, type);
          get().update(newFiles, true);
        },
        // meta
        moveFile: async (f: File, newPath: string) => {
          const v = get().view;
          await moveRequest(f.path, newPath, setErr);
          get().update(removeFromArr(v.dir.files.slice(), f.name), v.dir.sorted);
        },
        createFilePath: () => {
          return newFilePath(get().view.path);
        }
      }),
      {
        name: 'dir-state',
      },
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


