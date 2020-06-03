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
      const splitted = markdown.split('\n');
      module.exports[category].files[doc] = {
        name: splitted[0].slice(2),
        parts: splitted.filter(s => s.startsWith('## ')).map(s => s.slice(3)),
        markdown
      };
    });
  });
