const Command = require('../structures/command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "kick",
      aliases: [],
      ltu: client.constants.perms.staff
    });
  }

  async execute(message) {
    // addAction(message, user, mod, action, reason)
    const match = /(?:kick)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: kick <user-id/mention> <msg>");

    const user = await this.client.users.fetch(match[1]);
    const member = message.guild.members.get(user);

    user.send({ embed: this.client.constants.embedTemplates.dm(message, "Kicked", match[2]) })
      .catch(() => message.reply('Unable to DM user.'));

    await member.kick();

    let logsChan = this.client.db.settings.get(message.guild.id, "logschannel");
    if (logsChan && message.guild.channels.get(logsChan)) {
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, user, "Kick", match[2]) });
    }

    this.client.handlers.modNotes.addAction(message, user, message.author, "Kick", match[2]);
    return message.reply(`${user.tag} kicked.`);
  }
};