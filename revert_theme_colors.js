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
  { regex: /theme-primary/g, replacement: "[#7a0016]" },
  { regex: /theme-hover/g, replacement: "[#4a0414]" },
  { regex: /theme-accent/g, replacement: "[#fdb813]" },
  { regex: /theme-dark/g, replacement: "[#1a0107]" },
  { regex: /theme-danger/g, replacement: "[#b31b34]" },
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

console.log(`Reverted ${changedFiles} files back to hex colors.`);
