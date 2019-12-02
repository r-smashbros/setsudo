const Command = require("../../structures/command.js");
const moment = require("moment");
const { MessageEmbed, TextChannel } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "unmute",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    const match = /(?:mute)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: unmute <user-id/mention> <reason>");

    const user = await this.client.users.fetch(match[1]);
    const member = await message.guild.members.fetch(user).catch(() => null);

    const gSettings = this.client.db.settings.get(message.guild.id);
    let muteChan = this.client.db.detention.get(`${message.guild.id}-${user.id}`);
    let logsChan = gSettings["logschannel"];
    let muteRole = gSettings["mutedrole"];

    if (!muteRole || !message.guild.roles.get(muteRole)) return message.reply("The muted role is either not set or no longer exists");
    muteRole = message.guild.roles.get(muteRole);
    if (member) member.roles.remove(muteRole);

    await user.send({ embed: this.client.constants.embedTemplates.dm(message, `Unmuted`, match[2]) })
      .catch(() => message.reply("Unable to DM user."));

    if (muteChan && message.guild.channels.get(muteChan) && logsChan && message.guild.channels.get(logsChan)) {
      muteChan = message.guild.channels.get(muteChan);
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, user, `Unmute`, match[2]) });

      let muteChanMsg = await this.client.getChanMsg(muteChan);
      muteChanMsg = muteChanMsg
        .map(m => `${moment(m.createdAt).format("dddd MMMM Do, YYYY, hh:mm A")} | ${m.author.tag} (${m.author.id}):\n${m.content}`)
        .join("\n\n=-= =-= =-= =-= =-=\n\n");

      const embed = new MessageEmbed()
        .setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
        .setDescription("Mute Ended")
        .addField("Hastebin Link", await this.client.hastebin(muteChanMsg), false);

      logsChan.send({ embed });
    }

    if (typeof muteChan === TextChannel) muteChan.delete();
    else if (muteChan && message.guild.channels.get(muteChan)) message.guild.channels.get(muteChan).delete();

    this.client.db.tempModActions.delete(`${message.guild.id}-${user.id}`);
    this.client.db.detention.delete(`${message.guild.id}-${user.id}`);
    this.client.handlers.modNotes.addAction(message, user, message.author, `Unmute`, match[2]);
  }
};