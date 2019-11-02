class Snipe {
  constructor (bot, config) {
    this.config = config;
    this.bot = bot;

    bot.on('messageDelete', (msg) => {
      if (
        !msg.author || msg.channel.guild.id !== config.discord.boat.server ||
        msg.author.bot
      ) {
        return;
      }

      this.catch(msg, 'delete');
    });

    bot.on('messageUpdate', (msg, old) => {
      if (
        !old || !msg.author || msg.channel.guild.id !== config.discord.boat.server || msg.author.bot
      ) {
        return;
      }

      this.catch({
        ...msg,
        content: old.content
      }, 'edit');
    });
  }

  catch (msg, type) {
    if (Snipe.last && Snipe.last.id === msg.author.id) {
      Snipe.last.messages.push({
        msg: msg.content,
        type
      });
    } else {
      Snipe.last = {
        id: msg.author.id,
        author: `${msg.author.username}#${msg.author.discriminator}`,
        messages: [ {
          msg: msg.content,
          type
        } ]
      };
      setTimeout(() => Snipe.last = null, 10e3);
    }
  }
}

Snipe.last = null;
module.exports = Snipe;
