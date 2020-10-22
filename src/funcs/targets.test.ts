import { readTargets, storeTargets, addTarget, removeTarget, setActiveTarget, unsetActiveTarget, nextActiveTarget } from './targets';

it('tests use localStorageMock', () => {
    expect(localStorage.isMock()).toBe(true);
});

it('test addTarget', () => {
    let t = readTargets();
    
    t = addTarget(t, '/some/path');

    expect(t).toStrictEqual({"active":"","list":['/some/path']});
});

it('test removeTarget', () => {
    let t = readTargets();
    
    t = addTarget(t, '/some/path');
    t = addTarget(t, '/some/second/path');
    t = removeTarget(t, '/some/path');

    expect(t).toStrictEqual({"active":"","list":['/some/second/path']});
});

it('test unsetActiveTarget', () => {
    let t = readTargets();
    
    t = addTarget(t, '/some/path');
    t = setActiveTarget(t, '/dir/active');
    t = unsetActiveTarget(t);

    expect(t).toStrictEqual({"active":"","list":['/dir/active', '/some/path']});
});

it('test nextActiveTarget', () => {
    let t = readTargets();
    
    t = addTarget(t, '/some/path');
    t = setActiveTarget(t, '/zeta/xxx');

    expect(nextActiveTarget(t)).toStrictEqual('/some/path');

    t = setActiveTarget(t, '/some/path');

    expect(nextActiveTarget(t)).toStrictEqual('/zeta/xxx');
});


it('test storeTargets', () => {
    let t = readTargets();
    
    t = addTarget(t, '/some/path');
    t = addTarget(t, '/some/second/path');

    storeTargets(t);

    let tfresh = readTargets();

    expect(tfresh).toStrictEqual(t);
});
