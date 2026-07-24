const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'app', 'api')).filter(f => f.endsWith('route.ts'));

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Match any variation like: const params = context?.params || { id:''  };
  const replaced = content.replace(/const params = context\?\.params \|\| \{[^}]+\};/g, 'const params = context?.params || ({} as any);');
  if (replaced !== content) {
    fs.writeFileSync(file, replaced);
    console.log('Fixed ' + file);
  }
}
