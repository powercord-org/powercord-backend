require('fs')
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .forEach(filename => {
    const moduleName = filename.split('.')[0];
    try {
      const module = require(`${__dirname}/${filename}`);
      if (!module.func) {
        Object.entries(module).forEach(([ mdl, cmd ]) => {
          exports[mdl] = cmd;
        });
      } else {
        exports[moduleName] = module;
      }
    } catch (_) {
      // Don't annoy me you little shit
    }
  });
