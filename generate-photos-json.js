import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 兼容 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, 'docs/public/photos');
const output = {};
const basePrefix = ''; // 站点部署在根路径（base 为 '/'），无需前缀

function walk(dir, parents = []) {
  fs.readdirSync(dir).forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, [...parents, item]);
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(item)) {
      // 取最后一级目录作为地名
      const place = parents[parents.length - 1];
      if (!output[place]) output[place] = [];
      output[place].push({
        url: `${basePrefix}/photos/${parents.join('/')}/${item}`,
        caption: place
      });
    }
  });
}

walk(baseDir);

fs.writeFileSync(
  path.join(baseDir, 'photos.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log('photos.json generated!'); 