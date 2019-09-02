const Command = require('../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "search",
      aliases: [],
      ltu: client.constants.perms.staff
    });
  }

  async execute(message) {
    const match = /(?:search)(?:\s+(?:<@!?)?(\d{17,20})>?)/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: search <user-id/mention>");

    const user = await this.client.users.fetch(match[1]);

    message.channel.send({
      embed: await this.client.handlers.modNotes.listNotes(message, user)
    }).catch(e => { 
      message.reply("An error occurred. Contact the bot developer");
      console.error(e.stack);
    });
  }
};