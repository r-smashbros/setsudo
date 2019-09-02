const Command = require('../structures/command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "ban",
      aliases: [],
      ltu: client.constants.perms.staff
    });
  }

  async execute(message) {
    // addAction(message, user, mod, action, reason)
    const match = /(?:ban)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: ban <user-id/mention> <msg>");

    const user = await this.client.users.fetch(match[1]);

    const embed = new MessageEmbed()
      .setAuthor("Banned", message.guild.iconURL(), "https://google.com")
      .addField("» Moderator", `${message.author.tag} (${message.author.id})`, false)
      .addField("» Reason", match[2], false)
      .setTimestamp()
      .setColor(this.client.constants.colours.info);

    user.send({ embed }).catch(() => message.reply('Unable to DM user.'));
    user.send(`You may appeal in a month's time at the below URL.\n${this.client.constants.banAppealURL}`).catch(() => null);

    await (await message.guild.members.fetch(user.id)).ban();

    this.client.handlers.modNotes.addAction(message, user, message.author, "Ban", match[2]);
    return message.reply(`${user.tag} banned.`);
  }
};