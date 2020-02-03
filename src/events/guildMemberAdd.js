const Event = require("../structures/event.js");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "guildMemberAdd"
    });
  }

  /**
   * Entry point for guildMemberAdd event
   * @param {GuildMember} ctx The member that joined the server
   */
  async execute(ctx = null) {
    const guild = ctx.guild;
    const gSettings = await this.client.handlers.db.get("settings", guild.id);

    if (gSettings["memberlogschannel"] && guild.channels.get(gSettings["memberlogschannel"])) {
      const memberLogsChan = guild.channels.get(gSettings["memberlogschannel"]);
      memberLogsChan.send({ 
        embed: new MessageEmbed()
          .setAuthor(`${ctx.user.tag} (${ctx.user.id})`, ctx.user.avatarURL())
          .setColor(this.client.constants.colours.join)
          .setDescription("User Joined")
          .setTimestamp()
      });
    }
  }
};