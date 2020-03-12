const Command = require("../../structures/command.js");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "avatar",
      aliases: [],
      ltu: client.constants.perms.user,
      selfhost: true
    });
  }

  /**
   * Entry point for avatar command
   * @param {Message} message The message that invoked the command
   */
  async execute(message) {
  	const targetUser = /(\d{17,20})/.exec(message.content);

    if (targetUser) {
      const user = await this.client.users.fetch(targetUser[1]);
      if (!user) return message.reply("Invalid user provided. Did you enter a valid avatar ID?");

      const embed = new MessageEmbed()
        .setImage(user.avatarURL({ "dynamic": true, "size": 2048 }))
        .setTitle(`${user.username}'s avatar`);
      return message.channel.send({ embed });
    }

    const embed = new MessageEmbed()
      .setImage(message.author.avatarURL({ "dynamic": true, "size": 2048 }))
      .setTitle(`${message.author.username}'s avatar`);
  	message.channel.send({ embed });
  }
};	