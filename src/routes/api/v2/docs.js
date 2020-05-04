const marked = require('marked');
const documents = require('../../../documentation');

class Documentation {
  registerRoutes (express) {
    express.get('/api/v2/docs/categories', this.listCategories.bind(this));
    express.get('/api/v2/docs/:category/:doc', this.getDocument.bind(this));
  }

  listCategories (_, res) {
    res.json(
      Object.keys(documents).map(doc => ({
        id: doc,
        metadata: documents[doc].metadata,
        docs: Object.keys(documents[doc].files).map(file => ({
          id: file,
          name: documents[doc].files[file].name
        }))
      }))
    );
  }

  getDocument (req, res) {
    const { category, doc } = req.params;
    if (documents[category] && documents[category].files[doc]) {
      const { name, markdown } = documents[category].files[doc];
      const document = {
        name,
        contents: []
      };
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
            document.contents.push({
              type: 'TEXT',
              content: node.text
            });
            break;
          case 'code':
            document.contents.push({
              type: 'CODEBLOCK',
              lang: node.lang,
              code: node.text
            });
            break;
          case 'blockquote': {
            const blockquote = node.text.split('\n');
            document.contents.push({
              type: 'NOTE',
              color: blockquote.shift(),
              content: blockquote.join(' ')
            });
            break;
          }
          case 'list':
            document.contents.push({
              type: 'LIST',
              ordered: node.ordered,
              items: this._processListNode(node)
            });
            break;
          case 'table':
            document.contents.push({
              type: 'TABLE',
              thead: node.header,
              tbody: node.cells,
              center: node.align.map(a => a === 'center')
            });
        }
      });
      return res.json(document);
    }

    res.sendStatus(404);
  }

  _processListNode (node) {
    const list = [];
    node.items.forEach(item => {
      let str = '';
      item.tokens.forEach(tok => {
        switch (tok.type) {
          case 'text':
            str += `${tok.text}\n`;
            break;
          case 'list':
            list.push(str);
            str = '';
            list.push(this._processListNode(tok));
            break;
        }
      });
      if (str) {
        list.push(str);
      }
    });
    return list;
  }
}

module.exports = Documentation;
