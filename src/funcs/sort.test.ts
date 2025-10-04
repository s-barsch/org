import { describe, expect, test } from '@jest/globals';
import File, { newTextFile } from "./files";
import { joinDivided, skim } from "./sort";

describe('joinDivided', () => {
   test('joins divided files correctly', () => {
     const dirs: File[] = [
       newTextFile('dir1'),
       newTextFile('dir2'),
     ];
     const files: File[] = [
       newTextFile('file1.txt'),
       newTextFile('file2.txt'),
     ];
     const info: File = newTextFile('info');
     const sort: File = newTextFile('.sort');
     
     const divided = { dirs, files, info, sort };
     
     // Assuming joinDivided is exported for testing purposes
     const joined = joinDivided(divided);
     
     expect(joined).toHaveLength(6);
     expect(joined[0]).toEqual(dirs[0]);
     expect(joined[1]).toEqual(dirs[1]);
     expect(joined[2]).toEqual(info);
     expect(joined[3]).toEqual(files[0]);
     expect(joined[4]).toEqual(files[1]);
     expect(joined[5]).toEqual(sort);
   });
});

describe('skim', () => {
   test('removes system files and empty names', () => {
     const files: File[] = [
       newTextFile('file1.txt'),
       newTextFile('.sort'),
       newTextFile('info'),
       newTextFile(''),
       newTextFile('file2.txt'),
     ];
     
     const skimmedFiles = skim(files);
     
     expect(skimmedFiles).toHaveLength(2);
     expect(skimmedFiles).toContainEqual(files[0]);
     expect(skimmedFiles).toContainEqual(files[4]);
     expect(skimmedFiles).not.toContainEqual(files[1]);
     expect(skimmedFiles).not.toContainEqual(files[2]);
     expect(skimmedFiles).not.toContainEqual(files[3]);
    })
})