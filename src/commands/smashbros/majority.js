const Command = require("../../structures/command.js");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "majority",
      aliases: ["maj"],
      ltu: client.constants.perms.staff,
      selfhost: false
    });
  }

  /**
   * Entry point for majority command
   * @param {Message} message The message that invoked the command
   */
  async execute(message) {
    const gSettings = await this.client.handlers.db.get("settings", message.guild.id);
    let modCount = message.guild.roles.get(gSettings["staffrole"]).members.size
    const embed = new MessageEmbed()
        .addField("Majority", `${Math.round((modCount / 100) * 60 )}`, false)
        .addField("Super-majority", `${Math.round((modCount / 100) * 80 )}`, false);
    message.channel.send({ embed });
  }
};

