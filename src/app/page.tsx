"use client"; // Required for using React hooks and client-side features in Next.js App Router

import { useEffect, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import io from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!";
    return 0;
}`);
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp"); // Default language: C++

  useEffect(() => {
    // Initialize the socket connection inside useEffect
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Listen for output from the backend
    newSocket.on("output", (data) => {
      setOutput(data);
    });

    return () => {
      // Cleanup: Disconnect socket when component unmounts
      newSocket.disconnect();
    };
  }, []);

  const handleRunCode = () => {
    if (socket) {
      // Send code and language to the backend for execution
      socket.emit("run-code", { code, language });
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Code Editor */}
      <div style={{ flex: 1, padding: "10px" }}>
        <div style={{ marginBottom: "10px" }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: "5px", marginRight: "10px" }}
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <button onClick={handleRunCode} style={{ padding: "5px 10px" }}>
            Run Code
          </button>
        </div>
        <MonacoEditor
          height="80vh"
          language={language === "cpp" ? "cpp" : "java"}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      </div>

      {/* Output Panel */}
      <div style={{ flex: 1, padding: "10px", backgroundColor: "#1e1e1e", color: "#fff" }}>
        <h3>Output</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>{output}</pre>
      </div>
    </div>
  );
}
