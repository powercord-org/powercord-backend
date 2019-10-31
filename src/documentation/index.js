const requireAll = (path, fn) => {
  require('fs')
    .readdirSync(path)
    .filter(file => file !== 'index.js' && file !== 'manifest.json')
    .forEach(fn);
};

requireAll(__dirname, (category) => {
  module.exports[category] = {
    metadata: {},
    files: {}
  };
  requireAll(`${__dirname}/${category}`, (doc) => {
    if (doc === 'metadata.json') {
      module.exports[category].metadata = require(`${__dirname}/${category}/${doc}`);
    } else {
      const markdown = require('fs').readFileSync(`${__dirname}/${category}/${doc}`, 'utf8');
      module.exports[category].files[doc.split('.')[0]] = {
        name: markdown.split('\n')[0].slice(2),
        markdown
      };
    }
  });
});
