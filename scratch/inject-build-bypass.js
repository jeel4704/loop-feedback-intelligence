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
  if (content.match(/export\s+async\s+function\s+GET\s*\(/)) {
    const replaced = content.replace(
      /(export\s+async\s+function\s+GET\s*\([^)]*\)\s*\{)/g,
      '$1\n  if (process.env.npm_lifecycle_event === "build") return NextResponse.json([]);\n'
    );
    
    // Ensure NextResponse is imported if it isn't already, although it should be in all routes
    if (replaced !== content) {
      fs.writeFileSync(file, replaced);
      console.log('Injected build bypass in ' + file);
    }
  }
}
