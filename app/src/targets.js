import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as targets from './funcs/targets';


const TargetsProvider = ({ children }) => {
  const [list, setList] = useState([]);
  const [active, setActive] = useState("");

  const loadTargets = () => {
    setActive(targets.getActive());
    setList(targets.getList())
  }

  const listenForTargets = useCallback(evt => {
    loadTargets();
  }, []);

  useEffect(() => {
    window.addEventListener('storage', listenForTargets);

    return () => {
      window.removeEventListener('storage', listenForTargets);
    };
  }, [listenForTargets]);

  useEffect(() => {
    loadTargets();
  }, [])

  /* targets functions */

  const setActiveTarget = path => {
    targets.setActive(path);
    loadTargets();
  }

  const removeTarget = path => {
    targets.removeTarget(path);
    loadTargets();
  }

  let targetList = list
  let activeTarget = active

  return (
    <TargetsContext.Provider value={{ 
      targetList, activeTarget, removeTarget, setActiveTarget
    }}>
      {children}
    </TargetsContext.Provider>
  );
}

export const TargetsContext = createContext();
export default TargetsProvider; 
