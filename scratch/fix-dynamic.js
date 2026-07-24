const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const apiDir = path.join(process.cwd(), 'app', 'api');
const files = walkDir(apiDir).filter(f => f.endsWith('route.ts'));

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('export const dynamic')) {
        content = "export const dynamic = 'force-dynamic';\n" + content;
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed ' + file);
    }
}
