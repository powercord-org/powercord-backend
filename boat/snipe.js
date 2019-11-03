class Snipe {
  constructor (bot, config) {
    this.config = config;
    this.bot = bot;

    bot.on('messageDelete', (msg) => {
      if (!msg.author || msg.channel.guild.id !== config.discord.boat.server || msg.author.bot) {
        return;
      }

      this.catch(msg, 'delete');
    });

    bot.on('messageUpdate', (msg, old) => {
      if (!old || !msg.author || msg.channel.guild.id !== config.discord.boat.server || msg.author.bot) {
        return;
      }

      this.catch({
        ...msg,
        content: old.content
      }, 'edit');
    });
  }

  catch (msg, type) {
    Snipe.last.push({
      author: `${msg.author.username}#${msg.author.discriminator}`,
      msg: msg.content,
      type
    });
    setTimeout(() => Snipe.last.shift(), 10e3);
  }
}

Snipe.last = [];
module.exports = Snipe;
