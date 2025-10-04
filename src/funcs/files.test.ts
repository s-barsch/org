import { describe, expect, test } from '@jest/globals';
import File, { newTextFile, replaceFile } from "./files";

describe('replaceFile', () => {
    test('replaces a file in the array', () => {
        const files: File[] = [
            newTextFile('/path/to/file1.txt'),
            newTextFile('/path/to/file2.txt'),
            newTextFile('/path/to/file3.txt'),
        ];
        const oldFile = { ...files[1] };
        const newFile = newTextFile('/path/to/file2_renamed.txt');
        
        const updatedFiles = replaceFile(files, oldFile, newFile);
        
        expect(updatedFiles).toHaveLength(3);
        expect(updatedFiles).toContainEqual(newFile);
        expect(updatedFiles).not.toContainEqual(oldFile);
    });

    test('throws an error if the file to replace is not found', () => {
        const files: File[] = [
            newTextFile('/path/to/file1.txt'),
            newTextFile('/path/to/file2.txt'),
        ];
        const oldFile = newTextFile('/path/to/file3.txt');
        const newFile = newTextFile('/path/to/file3_renamed.txt');
        
        expect(() => replaceFile(files, oldFile, newFile)).toThrow('Could not replace file: file3.txt');
    });
});