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

    // Attempt to fetch the user's detention channel and return if it doesn't exist
    let detChan = this.client.db.detention.get(`${guild.id}-${ctx.user.id}`);
    if (!detChan) return;
    detChan = guild.channels.get(detChan);

    const gSettings = this.client.db.settings.get(guild.id);

    // Check if the guild has a logs channel
    if (gSettings["logschannel"] && guild.channels.get(gSettings["logschannel"])) {
      const logsChan = guild.channels.get(gSettings["logschannel"]);

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
    this.client.db.detention.delete(`${guild.id}-${ctx.user.id}`);
    this.client.db.tempModActions.delete(`${guild.id}-${ctx.user.id}`);
  }
};