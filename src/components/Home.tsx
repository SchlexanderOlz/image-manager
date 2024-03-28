import React from "react";
import "@/app/globals.css";

const Home = () => {
  return (
    <div className="h-screen flex items-center justify-center select-none">
      <div className="text-center space-y-5">
        <h1 className="text-5xl text-white font-bold pointer-events-none">
          Willkommen zur Bildverwaltung
        </h1>
        <p className="text-xl text-white">
          Hier kann man Bilder verwalten und hinzufügen.
        </p>
      </div>
    </div>
  );
};

export default Home;
