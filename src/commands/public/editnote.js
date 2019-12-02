const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "editnote",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    // editNote(message, user, nNum, note)
    const match = /(?:editnote)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+(\d+))(?:\s+(.+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: editnote <user-id/mention> <note #> <note>");

    const user = await this.client.users.fetch(match[1]);

    this.client.handlers.modNotes.editNote(message, user, match[2], match[3])
      .then(() => message.reply(`Note #${match[2]} for ${user.tag} edited`))
      .catch(e => message.reply(`ERR: ${e}`));
  }
};