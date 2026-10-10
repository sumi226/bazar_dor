"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      closeOnClick
      pauseOnHover
      draggable
      theme="light"
    />
  );
}
