require('fs')
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .forEach(filename => {
    const moduleName = filename.split('.')[0];
    try {
      exports[moduleName] = require(`${__dirname}/${filename}`);
    } catch (_) {
      // Don't annoy me you little shit
    }
  });
