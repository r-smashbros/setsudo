const Command = require('../structures/command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "tempban",
      aliases: [],
      ltu: client.constants.perms.staff
    });
  }

  async execute(message) {
    // addAction(message, user, mod, action, reason)
    const match = /(?:tempban)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+(\d+))(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: tempban <user-id/mention> <time-in-days> <reason>");

    const user = await this.client.users.fetch(match[1]);
    const member = await message.guild.members.fetch(match[1]);

    const endTime = Date.now() + (Number(match[2]) * 24 * 60 * 60 * 1000);

    user.send({ embed: this.client.constants.embedTemplates.dm(message, `Tempbanned (${match[2]} days)`, match[3]) })
      .catch(() => message.reply('Unable to DM user.'));
    
    await member.ban();

    let logsChan = this.client.db.settings.get(message.guild.id, "logschannel");
    if (logsChan && message.guild.channels.get(logsChan)) {
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, user, `Tempban (${match[2]} days)`, match[3]) });
    }

    this.client.db.tempModActions.set(`${message.guild.id}-${user.id}`, { action: "tempban", endTime });
    this.client.handlers.modNotes.addAction(message, user, message.author, `Tempban (${match[2]}d)`, match[3]);
    return message.reply(`${user.tag} tempbanned for ${match[2]} days.`);
  }
};