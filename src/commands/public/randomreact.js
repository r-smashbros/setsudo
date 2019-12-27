const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "randomreact",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    const input = /(?:randomreact)\s+(.+)/.exec(message.content);
    const msg = await message.channel.messages.fetch(input[1]).catch(e => null);

    if (!msg) return message.reply("Unable to locate message ID specified.");
    if (!msg.reactions.size) return message.reply("Found message but unable to find reactions.");

    const winner = (await msg.reactions.random().users.fetch()).random();
    return message.reply(`The randomly selected user is: ${winner.tag}`);
  }
};