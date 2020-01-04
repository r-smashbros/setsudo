const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "ban",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }
  /**
   * Entry point for the ban command
   * @param {Message} message The message that invoked the command
   * @returns {Message} The response to the command
   */
  async execute(message) {
    // addAction(message, user, mod, action, reason)
    const match = /(?:ban)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: ban <user-id/mention> <msg>");

    // Fetch affected user
    const user = await this.client.users.fetch(match[1]);

    // DM affected user that they were banned along with the ban appeal URL if possible
    await user.send({ embed: this.client.constants.embedTemplates.dm(message, "Banned", match[2]) })
      .catch(() => message.reply("Unable to DM user."));
    await user.send(`You may appeal at the URL below.\n<${this.client.constants.banAppealURL}>`)
      .catch(() => null);

    await message.guild.members.ban(user.id);

    // Check if guild has logs channel
    let logsChan = this.client.db.settings.get(message.guild.id, "logschannel");
    if (logsChan && message.guild.channels.get(logsChan)) {
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, user, "Ban", match[2]) });
    }

    // Append ban to user's mod notes DB entry
    this.client.handlers.modNotes.addAction(message, user, message.author, "Ban", match[2]);
    
    return message.reply(`${user.tag} banned.`);
  }
};