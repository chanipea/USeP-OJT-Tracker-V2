const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

const replacements = [
  { regex: /\[#7a0016\]/g, replacement: "theme-primary" },
  { regex: /\[#4a0414\]/g, replacement: "theme-hover" },
  { regex: /\[#fdb813\]/g, replacement: "theme-accent" },
  { regex: /\[#1a0107\]/g, replacement: "theme-dark" },
  { regex: /\[#b31b34\]/g, replacement: "theme-danger" },
  { regex: /\[#3a0310\]/g, replacement: "theme-hover" },
];

let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    replacements.forEach(r => {
        content = content.replace(r.regex, r.replacement);
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        changedFiles++;
    }
});

console.log(`Updated ${changedFiles} files with theme variables.`);
