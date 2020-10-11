import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as targets from './funcs/targets';


const TargetsProvider = ({ children }) => {
  const [targetList, setTargetList] = useState([]);
  const [activeTarget, setActiveTarget] = useState("");

  const loadTargets = () => {
    setActiveTarget(targets.getActive());
    setTargetList(targets.getList())
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

  const setActive = path => {
    targets.setActive(path);
    loadTargets();
  }

  const removeTarget = path => {
    targets.removeTarget(path);
    loadTargets();
  }

  return (
    <TargetsContext.Provider value={{ 
      targetList, activeTarget, removeTarget, setActive
    }}>
      {children}
    </TargetsContext.Provider>
  );
}

export const TargetsContext = createContext();
export default TargetsProvider; 
