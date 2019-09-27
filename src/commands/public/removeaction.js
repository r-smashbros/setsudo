const Command = require('../../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "removeaction",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    // removeAction(message, user, aNum)
    const match = /(?:removeaction)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+(\d+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: removeaction <user-id/mention> <note #>");

    const user = await this.client.users.fetch(match[1]);

    this.client.handlers.modNotes.removeAction(message, user, match[2])
      .then(() => message.reply(`Action #${match[2]} for ${user.tag} removed`))
      .catch(e => message.reply(`ERR: ${e}`));
  }
};