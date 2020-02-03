const Event = require('../structures/event.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageDelete"
    });
  }

  /**
   * Entry point for messageDelete event
   * @param {Message} message The deleted message
   */
  async execute(message) {
    if (!message.content) return;

    const guild = message.guild;
    const gSettings = await this.client.handlers.db.get("settings", message.guild.id);

    if (gSettings["messagelogschannel"] && guild.channels.get(gSettings["messagelogschannel"])) {
      const messageLogsChan = guild.channels.get(gSettings["messagelogschannel"]);
      messageLogsChan.send({
        embed: new MessageEmbed()
          .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL())
          .setColor(this.client.constants.colours.delete)
          .setDescription(message.content)
          .setFooter("Message Deleted")
          .setTimestamp()
      });
    }
  }
};