"use client";
import { useContext } from "react";
import { ComponentContext } from "@/context/MainContent";

const Home = () => {
  const { component } = useContext(ComponentContext)!;
  return <div>{component}</div>;
};

export default Home;
