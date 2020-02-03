const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "warn",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  /**
   * Entry point for warn command
   * @param {Message} message The message that invoked the command
   * @returns {Message} The response to the command
   */
  async execute(message) {

    // addAction(message, user, mod, action, reason)
    const match = /(?:warn)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: warn <user-id/mention> <msg>");

    const user = await this.client.users.fetch(match[1]);

    // DM affected user that they were warned if possible
    await user.send({ embed: this.client.constants.embedTemplates.dm(message, `Warned`, match[2]) })
      .catch(() => message.reply("Unable to DM user."));

    // Check if there is a log channel and send the log information
    const gSettings = await this.client.handlers.db.get("settings", message.guild.id);
    if (gSettings["modlogschannel"] && message.guild.channels.get(gSettings["modlogschannel"])) {
      message.guild.channels
        .get(gSettings["modlogschannel"])
        .send({ embed: this.client.constants.embedTemplates.logs(message, user, `Warn`, match[2]) });
    }

    // Append warn to the user's mod notes DB entry
    this.client.handlers.modNotes.addAction(message, user, message.author, "Warn", match[2]);
    return message.reply(`${user.tag} warned.`);
  }
};