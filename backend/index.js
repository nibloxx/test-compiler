// Backend: Node.js + Express + WebSockets
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("execute", ({ language, code, input }) => {
    let command;

    switch (language) {
      case "python":
        command = `echo "${input}" | python3 -c "${code}"`;
        break;
      case "cpp":
        command = `echo "${input}" | g++ -o temp.out && ./temp.out`;
        break;
      case "java":
        command = `echo "${input}" | javac Main.java && java Main`;
        break;
      default:
        socket.emit("output", "Unsupported language");
        return;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        socket.emit("output", stderr || error.message);
      } else {
        socket.emit("output", stdout);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server running on port 4000");
});