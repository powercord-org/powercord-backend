const marked = require('marked');
const documents = require('../../../documentation');

const docs = {
  // HTTP
  categories (req, res) {
    res.json(docs._listCategories());
  },

  document (req, res) {
    res.json(docs._getDocument(req.params.category, req.params.doc));
  },

  // Methods
  _listCategories () {
    return Object.keys(documents).map(doc => ({
      id: doc,
      metadata: documents[doc].metadata,
      docs: Object.keys(documents[doc].files).map(file => ({
        id: file,
        name: documents[doc].files[file].name
      }))
    }));
  },

  _getDocument (category, doc) {
    if (documents[category] && documents[category].files[doc]) {
      const { name, markdown } = documents[category].files[doc];
      const document = {
        name,
        contents: []
      };
      let inBlockquote = false;
      let blockquote = null;
      marked.lexer(markdown).forEach(node => {
        switch (node.type) {
          case 'heading':
            if (node.depth !== 1) {
              document.contents.push({
                type: 'TITLE',
                depth: node.depth,
                content: node.text
              });
            }
            break;
          case 'paragraph':
            if (inBlockquote) {
              if (blockquote) {
                blockquote.content += `\n\n${node.text}`;
              } else {
                const contents = node.text.split('\n');
                const color = contents.shift();
                blockquote = {
                  type: 'NOTE',
                  color: color.toUpperCase(),
                  content: contents.join('\n')
                };
              }
            } else {
              document.contents.push({
                type: 'TEXT',
                content: node.text
              });
            }
            break;
          case 'code':
            document.contents.push({
              type: 'CODEBLOCK',
              lang: node.lang,
              code: node.text
            });
            break;
          case 'blockquote_start':
            inBlockquote = true;
            break;
          case 'blockquote_end':
            inBlockquote = false;
            document.contents.push(blockquote);
            blockquote = null;
            break;
        }
      });
      return document;
    }
    return null;
  }
};

module.exports = docs;
