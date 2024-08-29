import {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import useView from '../../state';
import { join } from 'path-browserify';

export function MyDropzone() {
  const { view, reloadView } = useView();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(async (file) => {
        try {
          const path = join("/api/kine/upload", view.path, file.name)
          const response = await fetch(path, {
            method: "POST",
            body: file,
          });
          if (response.ok) {
            reloadView();
            return
          }
          console.log(await response.text());
        } catch (e) {
          console.error(e);
        }
        /*
      const reader = new FileReader()
      
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        const binaryStr = reader.result
        console.log(binaryStr)
      }
      reader.readAsArrayBuffer(file)
      */
    })
    
  }, [view])
  const {
    getRootProps,
    getInputProps,
  } = useDropzone({onDrop: onDrop});

  return (
    <div className='upload' {...getRootProps()}>
      <input {...getInputProps()} />
      Cover
    </div>
  )
}
