/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const marked = require('marked')

function processListNode (node) {
  const list = []
  node.items.forEach(item => {
    let str = ''
    item.tokens.forEach(tok => {
      switch (tok.type) {
        case 'text':
          str += `${tok.text}\n`
          break
        case 'list':
          list.push(str)
          str = ''
          list.push(processListNode(tok))
          break
      }
    })
    if (str) {
      list.push(str)
    }
  })
  return list
}

module.exports = function (markdown) {
  const lex = marked.lexer(markdown)
  let title = null
  const parts = []
  const contents = []
  for (const node of lex) {
    switch (node.type) {
      case 'heading':
        if (node.depth === 1) {
          title = node.text
        } else {
          if (node.depth === 2) parts.push(node.text)
          contents.push({
            type: 'TITLE',
            depth: node.depth,
            content: node.text
          })
        }
        break
      case 'paragraph':
        contents.push({
          type: 'TEXT',
          content: node.text
        })
        break
      case 'code':
        contents.push({
          type: 'CODEBLOCK',
          lang: node.lang,
          code: node.text
        })
        break
      case 'blockquote': {
        const blockquote = node.text.split('\n')
        contents.push({
          type: 'NOTE',
          quote: node.raw.startsWith('> '),
          color: !node.raw.startsWith('> ') && blockquote.shift().toUpperCase(),
          content: blockquote.join(' ').replace(/[ \n]*<br\/?>[ \n]*/ig, '\n')
        })
        break
      }
      case 'list':
        contents.push({
          type: 'LIST',
          ordered: node.ordered,
          items: processListNode(node)
        })
        break
      case 'table':
        contents.push({
          type: 'TABLE',
          thead: node.header,
          tbody: node.cells,
          center: node.align.map(a => a === 'center')
        })
    }
  }
  return { title, parts, contents }
}
