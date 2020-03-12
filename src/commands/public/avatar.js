const Command = require("../../structures/command.js");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "avatar",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  /**
   * Entry point for avatar command
   * @param {Message} message The message that invoked the command
   */
  async execute(message)
  {
  	const command = /(\d{17,20})/.exec(message.content);

    if (command) {
      const embed = new MessageEmbed()
            .setImage(this.client.users.get(command[1]).avatarURL({"size": 2048}))
            .setTitle(`${this.client.users.get(command[1]).username}'s avatar`);
      message.channel.send(embed);
    }

  	if (!command) {
  		const embed = new MessageEmbed()
            .setImage(message.author.avatarURL({"size": 2048}))
            .setTitle(`${message.author.username}'s avatar`);
  		message.channel.send(embed);
  	}
  }
};	