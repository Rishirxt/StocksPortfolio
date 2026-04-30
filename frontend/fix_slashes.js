const fs = require('fs');
const file = 'src/pages/TerminalUI.jsx';
let content = fs.readFileSync(file, 'utf8');

// replace literal \` with `
content = content.replace(/\\`/g, '`');
// replace literal \$ with $
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed backslashes in TerminalUI.jsx');
