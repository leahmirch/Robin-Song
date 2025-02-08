const { spawn } = require("child_process");

console.log("Starting Backend Server...");
const backendProcess = spawn("python", ["backend/src/server.py"], { stdio: "inherit" });

console.log("Starting Bird Detection Script...");
const detectProcess = spawn("python", ["backend/src/detect_birds.py"], { stdio: "inherit" });

console.log("Starting Expo Frontend...");
const expoProcess = spawn("npx", ["expo", "start"], { stdio: "inherit", shell: true });

process.on("exit", () => {
    backendProcess.kill();
    detectProcess.kill();
    expoProcess.kill();
});
