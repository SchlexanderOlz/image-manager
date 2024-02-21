'use client'

import React, { createContext, useState, ReactNode, FC } from 'react';
import Home from '@/components/Home'

type ComponentState = {
  component: ReactNode;
  setComponent: React.Dispatch<React.SetStateAction<ReactNode>>;
};


export const ComponentContext = createContext<ComponentState | undefined >(undefined);

export const ComponentProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [component, setComponent] = useState<ReactNode>(<Home />);

  return (
    <ComponentContext.Provider value={{ component, setComponent }}>
      {children}
    </ComponentContext.Provider>
  );
};
