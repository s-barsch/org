import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import File from 'funcs/files';
import type {} from '@redux-devtools/extension'

interface ViewState {
  view: viewObject;
  status: string;
  loadView: (path: string) => void
  setView: (v: viewObject) => void;
}

const useView = create<ViewState>()(
  devtools(
    persist(
      (set, get) => ({
        view: newView(),
        status: "",
        setView: () => {},
        loadView: async (path: string) => {
            const resp = await fetch("/api/view" + path);
            if (!resp.ok) {
                set({ status: resp.status + " - " + resp.statusText });
                return;
            }
            set({ view: await resp.json() })
        }
        ,
        //(by) => set((state) => ({ bears: state.bears + by }))
        renameView: () => {},
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


