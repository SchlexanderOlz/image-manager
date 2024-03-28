"use client";
import { useContext } from "react";
import { ComponentContext } from "@/context/MainContent";
import { SessionProvider } from "next-auth/react";

const Home = () => {
  const { component } = useContext(ComponentContext)!;
  return (
    <SessionProvider>
      <div>{component}</div>);
    </SessionProvider>
  );
};

export default Home;
