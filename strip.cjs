const fs = require('fs');
let t = fs.readFileSync('reference/isishey_blog_mockup_v5.html', 'utf-8');
t = t.replace(/data:image\/[^;"'\)]+;base64,[a-zA-Z0-9+/=]+/g, '<<REMOVED_BASE64>>');
fs.writeFileSync('temp_mockup.html', t);
console.log('Size after:', fs.statSync('temp_mockup.html').size);
