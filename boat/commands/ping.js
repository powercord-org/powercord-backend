module.exports = {
  desc: 'Pong.',
  func: (bot, msg) => {
    const startTime = Date.now();
    bot.createMessage(msg.channel.id, '🏓 Pong!').then(m => {
      const restLatency = Date.now() - startTime;
      m.edit(`🏓 Pong! | REST: ${restLatency}ms - Gateway: ${bot.shards.get(0).latency}ms`);
    });
  }
};
