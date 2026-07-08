const fs = require('fs');
let c = fs.readFileSync('utils/migrateDestinations.js', 'utf8');
c = c.replace(/spokenLanguage:\s*'([^']+)'/g, (match, lang) => {
  return "spokenLanguage: '" + lang.toLowerCase() + "'";
});
fs.writeFileSync('utils/migrateDestinations.js', c);
console.log('Done - languages lowercased');
