import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import File, { createDuplicate, insertDuplicateFile, insertNewDir, isPresent, merge, removeFile, renameText, updateFile } from './funcs/files';
import { basename, dirname, join } from 'path-browserify';
import { deleteRequest, moveRequest, newDirRequest, saveSortRequest, writeRequest } from './funcs/requests';
import { isDir, isText } from './funcs/paths';
import { errObj } from './context/err';
import { orgSort, isOrdered, isSortFile } from './funcs/sort';
import { newFilePath } from './funcs';

interface ViewState {
  view: viewObject;
  status: string;
  uploadStatus: string;
  setUploadStatus: (msg: string) => void;
  setView: (v: viewObject) => void
  loadView: (path: string) => void;
  reloadView: () => void;
  renameView: (oldPath: string, newName: string) => void;
  update: (newFiles: File[]) => void;
  addNewDir: (name: string) => void;
  writeFile: (f: File) => void;
  renameFile: (oldFile: File, newFile: File) => void;
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
        update: (newFiles: File[]) => {
          let v = get().view;
          v.files = newFiles;
          set({ view: v });

          if (isDir(v.path) && isOrdered(newFiles)) {
            saveSortRequest(v.path, newFiles, setErr)
          }
        },
        setView: (v: viewObject) => { set({ view: v }) },
        renameView: async (oldPath, newName) => {
          let oldName = basename(oldPath);
          let newPath = join(dirname(oldPath), newName);

          await moveRequest(oldPath, newPath, setErr);

          if (isText(newName)) {
            const newFiles = renameText(get().view.files.slice(), oldName, newName)
            get().update(newFiles);
          }
        },
        writeFile: async (f: File) => {
          await writeRequest(f.path, f.body, setErr);

          let v = get().view;
          v.files = updateFile( get().view.files.slice(), f)
          set({ view: v });
        },
        duplicateFile: async (f: File) => {
          const files = get().view.files.slice();
          let newF: File;
          try {
            newF = createDuplicate(f, files);
          } catch (err) {
            alert(err);
            return;
          }
          await writeRequest(newF.path, newF.body, setErr);

          const newFiles = insertDuplicateFile(files, f, newF)
          get().update(newFiles);
        },
        deleteFile: async (f: File) => {
          await deleteRequest(f.path, setErr);

          let newFiles = removeFile(get().view.files.slice(), f.name);

          if (isSortFile(f)) {
            newFiles = orgSort(newFiles)
          }

          get().update(newFiles);
        },
        addNewDir: async (name: string) => {
          const v = get().view;
          if (isPresent(v.files, name)) {
            alert("Dir with this name already exists.");
            return;
          }
          const dirPath = join(v.path, name);

          await newDirRequest(dirPath, setErr)
          get().update(insertNewDir(v.files.slice(), dirPath))
        },
        renameFile: async (oldFile: File, newFile: File) => {
          await moveRequest(oldFile.path, newFile.path, setErr);

          let newFiles = get().view.files.slice()
          if (!isOrdered(newFiles)) {
            newFiles = orgSort(newFiles)
          }

          get().update(newFiles);
        },
        saveSort: async (part: File[], type: string) => {
          const newFiles = merge(get().view.files.slice(), part, type);

          get().update(newFiles);
        },
        moveFile: async (f: File, newPath: string) => {
          const v = get().view;
          await moveRequest(f.path, newPath, setErr);
          get().update(removeFile(v.files.slice(), f.name));
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
    files: File[];
}

export type dirContent = {
    files:  File[];
    sorted: boolean;
}

export function newView(): viewObject {
    return {
        path: "",
        files: []
    };
}


