import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 3001;

const server = app.listen(Number(PORT), () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
    } else {
        console.error("❌ Server error:", error);
        process.exit(1);
    }
});