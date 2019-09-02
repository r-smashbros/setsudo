const Command = require('../structures/command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "silence",
      aliases: [],
      ltu: client.constants.perms.user
    });
  }

  async execute(message) {
    // addAction(message, user, mod, action, reason)
    const match = /(?:silence)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+(\d+))(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: silence <user-id/mention> <time-in-minutes> <reason>");

    const gSettings = this.client.db.settings.get(message.guild.id);
    let muteRole = gSettings['mutedrole'];
    if (!muteRole || !message.guild.roles.get(muteRole)) return message.reply('The muted role is either not set or no longer exists');
    muteRole = message.guild.roles.get(muteRole);

    const user = await this.client.users.fetch(match[1]);
    const member = await message.guild.members.fetch(match[1]);

    await member.roles.add(muteRole);
    const endTime = Date.now() + (Number(match[2]) * 60 * 1000);

    const embed = new MessageEmbed()
      .setAuthor(`Mute (${match[2]}m)`, message.guild.iconURL(), "https://google.com")
      .addField("» Moderator", `${message.author.tag} (${message.author.id})`, false)
      .addField("» Reason", match[3], false)
      .setTimestamp()
      .setColor(this.client.constants.colours.info);

    user.send({ embed }).catch(() => message.reply('Unable to DM user.'));

    this.client.db.tempModActions.set(`${message.guild.id}-${user.id}`, { action: "mute", endTime });
    this.client.handlers.modNotes.addAction(message, user, message.author, `Mute (${match[2]}m)`, match[3]);
    return message.reply(`${user.tag} muted for ${match[2]} minutes.`);
  }
};