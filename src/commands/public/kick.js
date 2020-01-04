const Command = require('../../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "kick",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  /**
   * Entry point for the kick command
   * @param {Message} message The message that invoked the command
   * @returns {Message} The response to the command
   */
  async execute(message) {
    // addAction(message, user, mod, action, reason)
    const match = /(?:kick)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: kick <user-id/mention> <msg>");

    // Fetch affected user and corresponding GuildMember instance
    const user = await this.client.users.fetch(match[1]);
    const member = await message.guild.members.fetch(match[1]);

    // DM affected user that they were kicked if possible
    await user.send({ embed: this.client.constants.embedTemplates.dm(message, "Kicked", match[2]) })
      .catch(() => message.reply('Unable to DM user.'));

    await member.kick();

    // Check if guild has logs channel
    let logsChan = this.client.db.settings.get(message.guild.id, "logschannel");
    if (logsChan && message.guild.channels.get(logsChan)) {
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, user, "Kick", match[2]) });
    }

    // Add kick to the user's mod notes DB entry
    this.client.handlers.modNotes.addAction(message, user, message.author, "Kick", match[2]);

    return message.reply(`${user.tag} kicked.`);
  }
};