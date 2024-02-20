import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ComponentProvider } from '@/components/LandingPageContext';
import { useComponent } from '@/components/LandingPageContext';

interface HomeProps {
  component: React.ComponentType<any>;
  page_props: Record<string, any>;
}

const Home: React.FC<HomeProps> = ({ component: Component = () => null, page_props: pageProps }) => {
  return (
    <ComponentProvider>
      <Component {...pageProps}></Component>
    </ComponentProvider>
  );
}

export default Home;
