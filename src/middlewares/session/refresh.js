const DiscordOAuth = require('../../util/oauth/discord');

module.exports = async (req) => {
  if (!req.session.discord) {
    const { discord } = req.session.user.accounts;
    const user = await DiscordOAuth.getUserByBearer(discord.access_token);
    if (!user.id) {
      return false;
    }

    // Save username/avatar
    await req.db.users.update(user.id, {
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`
        : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`
    });

    req.session.discord = user;
  }
  return true;
};
