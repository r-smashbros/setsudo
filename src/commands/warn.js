const Command = require('../structures/command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "warn",
      aliases: [],
      ltu: client.constants.perms.staff
    });
  }

  async execute(message) {
    // addAction(message, user, mod, action, reason)
    const match = /(?:warn)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: warn <user-id/mention> <msg>");

    const user = await this.client.users.fetch(match[1]);

    const embed = new MessageEmbed()
      .setAuthor("Warning", message.guild.iconURL, "https://google.com")
      .addField("» Moderator", `${message.author.tag} (${message.author.id})`, false)
      .addField("» Reason", match[2], false)
      .setTimestamp()
      .setColor(this.client.constants.colours.info);
    
    user.send({ embed }).catch(() => message.reply('Unable to DM user.'));

    this.client.handlers.modNotes.addAction(message, user, message.author, "Warn", match[2]);
    return message.reply(`${user.tag} warned.`);
  }
};