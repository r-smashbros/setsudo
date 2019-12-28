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
    const match = /(?:randomreact)(?:\s+(?:<#)?(\d{17,20})>?)?(?:\s+(\d{17,20}))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: randomreact [channel-id/mention] <message-id/mention>");

    const msgChan = match[1] ? message.guild.channels.get(match[1]) : message.channel;
    if (!msgChan) return message.reply("The provided channel ID is not valid.");

    const msg = await msgChan.messages.fetch(match[2]).catch(e => null);

    if (!msg) return message.reply("Unable to locate message ID.");
    if (!msg.reactions.size) return message.reply("Found message but unable to find reactions.");

    const winner = (await msg.reactions.random().users.fetch()).random();
    return message.reply(`The randomly selected user is: ${winner.tag}`);
  }
};