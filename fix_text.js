const fs = require('fs');
const path = require('path');
const dir = 'frontend/src/components';
const files = fs.readdirSync(dir).map(f => path.join(dir, f)).filter(f => f.endsWith('.tsx'));
files.push('frontend/src/App.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf-8');

  if (f.includes('Dashboard.tsx')) {
    content = content.replace('text-7xl md:text-8xl font-semibold tracking-tighter text-[#7a0016]', 'text-7xl md:text-8xl font-semibold tracking-tighter text-[#7a0016] dark:text-white');
    content = content.replace('text-[#7a0016]">{progressPercentage', 'text-[#7a0016] dark:text-white">{progressPercentage');
    content = content.replace('bg-[#7a0016] h-full', 'bg-[#7a0016] dark:bg-zinc-400 h-full');
  }

  if (f.includes('History.tsx')) {
    content = content.replace('text-3xl font-semibold tracking-tighter text-[#7a0016]', 'text-3xl font-semibold tracking-tighter text-[#7a0016] dark:text-white');
  }

  if (f.includes('TopNav.tsx')) {
    content = content.replace('text-[#1a0107]">Internship', 'text-[#1a0107] dark:text-zinc-300">Internship');
  }

  content = content.replace(/text-\[#1a0107\](?! dark:text-)/g, 'text-[#1a0107] dark:text-white');
  content = content.replace(/text-\[#7a0016\](?! dark:text-)/g, 'text-[#7a0016] dark:text-[#fca5a5]');
  content = content.replace(/text-\[#2a020b\](?! dark:text-)/g, 'text-[#2a020b] dark:text-white');

  content = content.replace(/bg-\[#1a0107\] text-white(?! dark:bg-)/g, 'bg-[#1a0107] text-white dark:bg-zinc-800');
  content = content.replace(/bg-\[#2a020b\] text-white(?! dark:bg-)/g, 'bg-[#2a020b] text-white dark:bg-zinc-800');
  content = content.replace(/bg-\[#7a0016\] text-white(?! dark:bg-)/g, 'bg-[#7a0016] text-white dark:bg-red-500');

  content = content.replace(/border-\[#2a020b\](?! dark:border-)/g, 'border-[#2a020b] dark:border-zinc-700');
  content = content.replace(/border-\[#3a0310\](?! dark:border-)/g, 'border-[#3a0310] dark:border-zinc-700');

  fs.writeFileSync(f, content);
});
