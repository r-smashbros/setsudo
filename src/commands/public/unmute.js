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

  /**
   * Entry point for the unmute command
   * @param {Message} message The message that invoked the command
   * @returns {Message} The response to the command
   */
  async execute(message) {
    const match = /(?:mute)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: unmute <user-id/mention> <reason>");

    // Fetch muted user and corresponding GuildMember instance
    const user = await this.client.users.fetch(match[1]);
    const member = await message.guild.members.fetch(user).catch(() => null);

    // Fetch guild settings and mute channel
    const gSettings =  await this.client.handlers.db.get("settings", message.guild.id);
    let logsChan = gSettings["modlogschannel"];
    let muteRole = gSettings["mutedrole"];

    let muteChan = await this.client.handlers.db.get("detention", `${message.guild.id}-${user.id}`);
    if (muteChan) muteChan = muteChan["data"];

    // Check if mutedrole setting is still valid
    if (!muteRole || !message.guild.roles.get(muteRole)) return message.reply("The muted role is either not set or no longer exists");
    muteRole = message.guild.roles.get(muteRole);

    // Remove muted role if the member is still in the server
    if (member) member.roles.remove(muteRole);

    // DM affected user that they were unmuted if possible
    await user.send({ embed: this.client.constants.embedTemplates.dm(message, `Unmuted`, match[2]) })
      .catch(() => message.reply("Unable to DM user."));

    // Check if both the mute channel still exists and a logs channel is set
    if (muteChan && message.guild.channels.get(muteChan) && logsChan && message.guild.channels.get(logsChan)) {
      muteChan = message.guild.channels.get(muteChan);
      logsChan = message.guild.channels.get(logsChan);

      // Send templated log message to log channel
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, user, `Unmute`, match[2]) });

      // Fetch messages from user's muted channel and format them
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

    // Call delete function if muteChan is a TextChannel. Otherwise, attempt to fetch and delete the channel.
    if (muteChan instanceof TextChannel) muteChan.delete();
    else if (muteChan && message.guild.channels.get(muteChan)) message.guild.channels.get(muteChan).delete();

    // Purge DBs of all mute references.
    await this.client.handlers.db.delete("tempmodactions", `${message.guild.id}-${user.id}`);
    await this.client.handlers.db.delete("detention", `${message.guild.id}-${user.id}`);

    // Append unmute to user's mod notes DB entry
    this.client.handlers.modNotes.addAction(message, user, message.author, `Unmute`, match[2]);
  }
};