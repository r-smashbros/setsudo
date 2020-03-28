const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "purge",
      aliases: ["prune", "clean"],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  /**
   * Entry point for purge command
   * @param {Message} message The message that invoked the command
   */
  async execute(message) {
    const match = /(?:purge)(?:\s+(?:<@!?)?(\d{17,20})>?)?(?:\s+(\d{0,2}))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: purge [user-id/mention>] <msg-count>");

    let chanMsg;
    if (match[1]) {
      chanMsg = await message.channel.messages.fetch({ limit: 100 });
      if (!chanMsg || !chanMsg.size) return message.reply("An error occurred! I couldn't find any messages to purge.");

      chanMsg = chanMsg.filter(msg => msg.author.id === match[1]);
      if (!chanMsg.size) return message.reply("An error occurred! I couldn't find any messages from the provided user to purge.");
    }

    return message.channel.bulkDelete(match[1] ? chanMsg : match[2])
      .then(() => message.reply(`${match[2]} messages deleted!`).then(m => m.delete({ timeout: 5000 })))
      .catch(() => message.reply("An error occurred! I cannot purge messages over two weeks old."));
  }
};