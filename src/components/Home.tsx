import React from 'react';
import "@/app/globals.css"

const Home = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <h1 className="text-5xl text-white font-bold">Willkommen zur Bildverwaltung</h1>
        <p className="text-xl text-white">Hier kann man Bilder verwalten und hinzufügen.</p>
      </div>
    </div>
  );
};

export default Home;
