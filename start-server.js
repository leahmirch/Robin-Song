const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Detect the operating system
const isWindows = process.platform === "win32";

// Set paths based on OS
const backendPath = path.join(__dirname, "backend");
const venvPath = path.join(backendPath, "venv");
const pythonBinary = isWindows
    ? path.join(venvPath, "Scripts", "python.exe") // Windows
    : path.join(venvPath, "bin", "python3"); // Mac/Linux

const activateScript = isWindows
    ? path.join(venvPath, "Scripts", "activate") // Windows
    : path.join(venvPath, "bin", "activate"); // Mac/Linux

// Check if virtual environment exists
const venvExists = fs.existsSync(venvPath);

if (!venvExists) {
    console.log("🚀 Virtual Environment not found. Creating one...");
    const venvSetup = spawn(isWindows ? "python" : "python3", ["-m", "venv", venvPath], { stdio: "inherit", shell: true });

    venvSetup.on("exit", (code) => {
        if (code !== 0) {
            console.error("Failed to create virtual environment.");
            process.exit(1);
        }
        console.log("Virtual Environment Created.");
        startProcesses();
    });
} else {
    console.log("Virtual Environment found. Skipping creation.");
    startProcesses();
}

// Function to start backend, bird detection, and frontend
function startProcesses() {
    console.log("Activating Virtual Environment and Starting Services...");

    // Start Backend Server
    console.log("Starting Backend Server...");
    const backendProcess = spawn(pythonBinary, ["backend/src/server.py"], { stdio: "inherit", shell: isWindows });

    // Start Bird Detection Script
    console.log("Starting Bird Detection Script...");
    const detectProcess = spawn(pythonBinary, ["backend/src/detect_birds.py"], { stdio: "inherit", shell: isWindows });

    // Start Expo Frontend
    console.log("Starting Expo Frontend...");
    const expoProcess = spawn("npx", ["expo", "start"], { stdio: "inherit", shell: true });

    // Kill all processes when exiting
    process.on("exit", () => {
        backendProcess.kill();
        detectProcess.kill();
        expoProcess.kill();
    });

    process.on("SIGINT", () => {
        console.log("\n Shutting down all processes...");
        backendProcess.kill();
        detectProcess.kill();
        expoProcess.kill();
        process.exit();
    });
}
