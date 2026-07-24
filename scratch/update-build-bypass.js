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
  if (content.includes('npm_lifecycle_event === "build"')) {
    const replaced = content.replace(
      /if \(process\.env\.npm_lifecycle_event === "build"\) return NextResponse\.json\(\[\]\);/g,
      'if (process.env.NEXT_BUILD_PHASE === "true" || process.env.npm_lifecycle_event === "build") return NextResponse.json([]);'
    );
    
    if (replaced !== content) {
      fs.writeFileSync(file, replaced);
      console.log('Fixed build bypass in ' + file);
    }
  }
}
