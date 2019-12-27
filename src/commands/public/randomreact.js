const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "randomreact",
      aliases: [],
      ltu: client.constants.perms.helper,
      selfhost: true
    });
  }

  async execute(message) {
    const input = /(?:randomreact)\s+(.+)/.exec(message.content);

    try { message = await message.channel.messages.fetch(input[1]); } catch { return message.reply("Unable to locate message ID specified.") };

    if (!message.reactions.size) return message.reply("Found message but unable to find reactions.");

    const reactUsers = await message.reactions.random().users.fetch();
    const winner = reactUsers.random();

    return message.reply(`The randomly selected user is: ${winner.tag}`);
  }

};