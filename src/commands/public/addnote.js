const Command = require('../../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "addnote",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    // addNote(message, user, mod, note)
    const match = /(?:addnote)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: addnote <user-id/mention> <note>");

    const user = await this.client.users.fetch(match[1]);

    this.client.handlers.modNotes.addNote(message, user, message.author, match[2])
      .then(() => message.reply(`Note for ${user.tag} added`))
      .catch(e => message.reply(`ERR: ${e}`));
  }
};