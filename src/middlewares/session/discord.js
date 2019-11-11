const DiscordOAuth = require('../../util/oauth/discord');

module.exports = async (req) => {
  const { discord } = req.session.user.accounts;
  if (isNaN(discord.expiryDate) || Date.now() >= discord.expiryDate) {
    let tokens;
    try {
      tokens = await DiscordOAuth.refreshToken(discord.refresh_token);
    } catch (e) {
      return false;
    }

    discord.access_token = tokens.access_token;
    await req.db.users.update(req.session.user._id, {
      'accounts.discord.access_token': discord.access_token,
      'accounts.discord.expiryDate': Date.now() + (tokens.expires_in * 1000)
    });
  }
  return true;
};
