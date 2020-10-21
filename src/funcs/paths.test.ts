import { dateToTimestamp, shortYear, leadingZero } from './paths';
import { orgBase, extendedBase, section, isText } from './paths';

it('shortYear results', () => {
    expect(shortYear(2006)).toBe("06");
    expect(shortYear(2020)).toBe("20");
});

it('leadingZero results', () => {
    expect(leadingZero(100)).toBe("100");
    expect(leadingZero(10)).toBe("10");
    expect(leadingZero(1)).toBe("01");
});

it('dateToTimestamp results', () => {
   expect(dateToTimestamp(new Date("2020-10-21T20:25:26+00:00"))).toBe("201021_222526") 
});


it('orgBase results', () => {
    expect(orgBase("/")).toBe("org");
    expect(orgBase("/some/deep/dir")).toBe("dir");
    expect(orgBase("/some.jpg")).toBe("some.jpg");
});

it('extendedBase results', () => {
    expect(extendedBase("/")).toBe("org");
    expect(extendedBase("/some/deep/dir")).toBe("dir");
    expect(extendedBase("/some/deep/file.txt")).toBe("file.txt");
    expect(extendedBase("/some/deep/dir/bot")).toBe("dir/bot");
    expect(extendedBase("/some/deep/20-10/02")).toBe("20-10/02");
    expect(extendedBase("/some.jpg")).toBe("some.jpg");
});

it('section results', () => {
    expect(section("/")).toBe("private");
    expect(section("/some/deep/dir")).toBe("private");
    expect(section("/some/deep/file.txt")).toBe("private");
    expect(section("/some.jpg")).toBe("private");
    expect(section("/public/some.jpg")).toBe("public");
    expect(section("/public")).toBe("public");
});


it('isText results', () => {
    expect(isText("")).toBe(false)
    expect(isText("/")).toBe(false)
    expect(isText("/some.txt")).toBe(true)
    expect(isText("/info")).toBe(true)
    expect(isText("/.sort")).toBe(true)
});
