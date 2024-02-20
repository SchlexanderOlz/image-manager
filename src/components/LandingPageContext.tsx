'use client'
import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

interface ComponentContextProps {
  selectedComponent: ReactNode | null;
  setComponent: Dispatch<SetStateAction<ReactNode | null>>;
}

const LandingPageContext = createContext<ComponentContextProps | undefined>(undefined);

interface ComponentProviderProps {
  children: ReactNode;
}

export const ComponentProvider: React.FC<ComponentProviderProps> = ({ children }) => {
  const [selectedComponent, setSelectedComponent] = useState<ReactNode | null>(null);

  const setComponent = (component: SetStateAction<ReactNode | null>) => {
    setSelectedComponent(component);
  };

  const contextValue: ComponentContextProps = {
    selectedComponent,
    setComponent,
  };

  return (
    <LandingPageContext.Provider value={contextValue}>
      {children}
    </LandingPageContext.Provider>
  );
};

export function useComponent(): ComponentContextProps {
  const context = useContext(LandingPageContext);
  if (!context) {
    throw new Error("useComponent must be used within a ComponentProvider");
  }
  return context;
}
