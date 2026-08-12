const fs = require("fs");
const file = "src/vibe-sandbox/VibeStudyRoom.tsx";
let code = fs.readFileSync(file, "utf8");

code = code.replace(/const data = await res\.json\(\);/g, `let data;
        try {
          const text = await res.text();
          data = JSON.parse(text);
        } catch (e) {
          data = { result: "Server Error: " + (e.message || "Invalid JSON") };
        }`);

fs.writeFileSync(file, code);
