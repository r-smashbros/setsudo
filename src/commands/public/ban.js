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
    const match = /(?:ban)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([0-7]))?(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: ban <user-id/mention> [days-to-purge] <msg>");

    // Fetch affected user
    const user = await this.client.users.fetch(match[1]);

    // DM affected user that they were banned along with the ban appeal URL if possible
    await user.send({ embed: this.client.constants.embedTemplates.dm(message, "Banned", match[3]) })
      .catch(() => message.reply("Unable to DM user."));
    await user.send(`You may appeal at the URL below.\n<${this.client.constants.banAppealURL}>`)
      .catch(() => null);

    await message.guild.members.ban(user.id, { days: match[2] || 0 });

    // Check if guild has logs channel
    const gSettings = await this.client.handlers.db.get("settings", message.guild.id);
    if (gSettings["modlogschannel"] && message.guild.channels.get(gSettings["modlogschannel"])) {
      message.guild.channels
        .get(gSettings["modlogschannel"])
        .send({ embed: this.client.constants.embedTemplates.logs(message, user, "Ban", match[3]) });
    }

    // Append ban to user's mod notes DB entry
    this.client.handlers.modNotes.addAction(message, user, message.author, "Ban", match[3]);
    
    return message.reply(`${user.tag} banned.`);
  }
};