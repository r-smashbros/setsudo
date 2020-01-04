const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "editaction",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  /**
   * Entry point for editaction command
   * @param {Message} message The message that invoked the command
   * @returns {Message|null} Returns Message instance if an error occurs. Otherwise, nothing is returned.
   */
  async execute(message) {
    // editAction(message, user, aNum, note)
    const match = /(?:editaction)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+(\d+))(?:\s+(.+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: editaction <user-id/mention> <action #> <reason>");

    const user = await this.client.users.fetch(match[1]);

    this.client.handlers.modNotes.editAction(message, user, match[2], match[3])
      .then(() => message.reply(`Action #${match[2]} for ${user.tag} edited`))
      .catch(e => message.reply(`ERR: ${e}`));
  }
};