const { readdirSync } = require('fs');
const { join } = require('path');

const registerRoutes = (express, path) => {
  readdirSync(path)
    .filter(file => file !== 'index.js')
    .forEach(filename => {
      const filepath = join(path, filename);
      if (filename.endsWith('.js')) {
        const Module = require(filepath);
        if (Module.prototype && Module.prototype.registerRoutes) {
          const mdl = new Module();
          mdl.registerRoutes(express);
        }
      } else {
        registerRoutes(express, filepath);
      }
    });
};

module.exports = (express) => {
  const initial = express._router.stack.length;
  registerRoutes(express, __dirname);
  console.log(`${express._router.stack.length - initial} routes loaded.`);
};
