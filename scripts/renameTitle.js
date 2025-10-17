const fs = require("fs");
const path = require("path");

const filePath = path.join(process.cwd(), "build", "index.html");

try {
    let html = fs.readFileSync(filePath, "utf8");
    
    // 개행·공백 포함해 안전하게 치환
    html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>predix</title>");
    fs.writeFileSync(filePath, html);
    console.log("✅ index.html title updated to 'predix'");
} catch (err) {
    console.error("❌ Failed to update title:", err);
    process.exit(1);
}