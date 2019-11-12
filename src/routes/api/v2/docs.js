const marked = require('marked');
const documents = require('../../../documentation');

class Documentation {
  registerRoutes (express) {
    express.get('/api/v2/docs/categories', this.listCategories.bind(this));
    express.get('/api/v2/docs/:category/:doc', this.getDocument.bind(this));
  }

  listCategories (req, res) {
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
      let inBlockquote,
        inList = false;
      let blockquote,
        listItem,
        list = null;
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
          case 'text':
            if (inList) {
              listItem += `${node.text}\n`;
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
          case 'list_start':
            list = {
              type: 'LIST',
              ordered: node.ordered,
              items: []
            };
            break;
          case 'list_end':
            document.contents.push(list);
            break;
          case 'list_item_start':
            inList = true;
            listItem = '';
            break;
          case 'list_item_end':
            inList = false;
            list.items.push(listItem);
            blockquote = null;
            break;
        }
      });
      return res.json(document);
    }

    res.sendStatus(404);
  }
}

module.exports = Documentation;
