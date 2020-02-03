const Event = require('../structures/event.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageUpdate"
    });
  }

  /**
   * Entry point for messageUpdate event
   * 
   * @param {Message} oldMsg The original version of the message
   * @param {Message} newMsg The updated version of the message
   */
  async execute(oldMsg, newMsg) {
    if (oldMsg.content === newMsg.content) return;

    const guild = oldMsg.guild;
    const gSettings = await this.client.handlers.db.get("settings". guild.id);

    if (gSettings["messagelogschannel"] && guild.channels.get(gSettings["messagelogschannel"])) {
      const messageLogsChan = guild.channels.get(gSettings["messagelogschannel"]);
      messageLogsChan.send({
        embed: new MessageEmbed()
          .setAuthor(`${oldMsg.author.tag} (${oldMsg.author.id})`, oldMsg.author.avatarURL())
          .setColor(this.client.constants.colours.edit)
          .addField("Original Message", oldMsg.content, false)
          .addField("Updated Message", newMsg.content, false)
          .setFooter("Message Updated")
          .setTimestamp()
      });
    }
  }
};