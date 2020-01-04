const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "removenote",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  /**
   * Entry point for removenote command
   * @param {Message} message The message that invoked the command
   * @returns {Message|null} Returns Message instance if an error occurs. Otherwise, nothing is returned.
   */
  async execute(message) {
    // removeNote(message, user, nNum)
    const match = /(?:removenote)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+(\d+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: removenote <user-id/mention> <note #>");

    const user = await this.client.users.fetch(match[1]);

    this.client.handlers.modNotes.removeNote(message, user, match[2])
      .then(() => message.reply(`Note #${match[2]} for ${user.tag} removed`))
      .catch(e => message.reply(`ERR: ${e}`));
  }
};