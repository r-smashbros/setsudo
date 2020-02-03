const Event = require("../structures/event.js");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "guildMemberRemove"
    });
  }

  /**
   * Entry point for guildMemberRemove event
   * @param {GuildMember} ctx The member that left/was removed from the server
   */
  async execute(ctx = null) {
    const guild = ctx.guild;
    const gSettings = await this.client.handlers.db.get("settings", guild.id);

    if (gSettings["memberlogschannel"] && guild.channels.get(gSettings["memberlogschannel"])) {
      const memberLogsChan = guild.channels.get(gSettings["memberlogschannel"]);
      memberLogsChan.send({ 
        embed: new MessageEmbed()
          .setAuthor(`${ctx.user.tag} (${ctx.user.id})`, ctx.user.avatarURL())
          .setColor(this.client.constants.colours.leave)
          .setDescription("User Left/Banned")
          .setTimestamp()
      });
    }

    // Attempt to fetch the user's detention channel and return if it doesn't exist
    let detChan = await this.client.handlers.db.get("detention", `${guild.id}-${ctx.user.id}`);
    if (!detChan) return;
    detChan = guild.channels.get(detChan["data"]);

    // Check if the guild has a logs channel
    if (gSettings["modlogschannel"] && guild.channels.get(gSettings["modlogschannel"])) {
      const logsChan = guild.channels.get(gSettings["modlogschannel"]);

      // Fetch all messages from the detention channel and format them
      let detChanMsg = await this.client.getChanMsg(detChan);
      detChanMsg = detChanMsg
        .map(m => `${moment(m.createdAt).format("dddd MMMM Do, YYYY, hh:mm A")} | ${m.author.tag} (${m.author.id}):\n${m.content}`)
        .join("\n\n=-= =-= =-= =-= =-=\n\n");

      // Create embed for logs
      const embed = new MessageEmbed()
        .setAuthor(`${ctx.user.tag} (${ctx.user.id})`, ctx.user.displayAvatarURL())
        .setDescription("Detention Ended (User Left/Banned)")
        .addField("Hastebin Link", await this.client.hastebin(detChanMsg), false);

      logsChan.send({ embed });
    }

    // Delete detention channel and all related DB entries
    detChan.delete();
    await this.client.handlers.db.delete("detention", `${guild.id}-${ctx.user.id}`);
    await this.client.handlers.db.delete("tempmodactions", `${guild.id}-${ctx.user.id}`);
  }
};