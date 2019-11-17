require('fs')
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file !== 'manifest.json')
  .forEach(category => {
    const metadata = require(`${__dirname}/${category}/metadata.json`);
    module.exports[category] = {
      metadata,
      files: {}
    };

    metadata.docs.forEach(doc => {
      const markdown = require('fs').readFileSync(`${__dirname}/${category}/${doc}.md`, 'utf8');
      module.exports[category].files[doc] = {
        name: markdown.split('\n')[0].slice(2),
        markdown
      };
    });
  });
