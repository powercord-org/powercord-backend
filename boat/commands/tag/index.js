const list = require('./list');
const add = require('./add');
const edit = require('./edit');
const deleteTag = require('./delete');
const exec = require('./exec');

module.exports = {
  desc: 'Execute or manage tags.',
  permissions: (msg, r) => r || msg.content.match(/tag (add|edit|delete)/) ? [ 'manageMessages' ] : [],
  func: (bot, msg, _, mongo) => {
    const args = msg.content.split(' ').slice(1);
    if (args.length === 0) {
      return bot.createMessage(msg.channel.id, 'Syntax: `pc/tag [tag]` or `pc/tag list` or `pc/tag [add|edit|delete] [tag name] [contents]`');
    }

    const arg0 = args.shift();
    const arg1 = args.shift();
    const arg2 = args.join(' ');
    switch (arg0) {
      case 'list':
        list(bot, msg, mongo);
        break;
      case 'add':
        add(bot, msg, arg1, arg2, mongo);
        break;
      case 'edit':
        edit(bot, msg, arg1, arg2, mongo);
        break;
      case 'delete':
        deleteTag(bot, msg, arg1, mongo);
        break;
      default:
        exec(bot, msg, arg0, mongo);
        break;
    }
  }
};
