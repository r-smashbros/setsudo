const Command = require("../../structures/command.js");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "undetention",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  /**
   * Entry point for undetention command
   * @param {Message} message The message that invoked the command
   * @returns {Message} The response to the command
   */
  async execute(message) {
    const gSettings = await this.client.handlers.db.get("settings", message.guild.id);

    let detRole = gSettings["detentionrole"];

    const match = /(?:undetention)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);

    // Check for valid syntax, valid detention role, and if the member is still in the server
    if (!detRole || !message.guild.roles.get(detRole)) return message.reply("The detention role is either not set or no longer exists");
    if (!match) return message.reply("Invalid Syntax: undetention <user-id/mention> <reason>");
    if (!message.guild.members.get(match[1])) return message.reply("The supplied user is no longer a member of the guild.");

    // Fetch detention user, GuildMember instance, and detention role
    const detUser = this.client.users.get(match[1]);
    const detMember = message.guild.members.get(match[1]);
    detRole = message.guild.roles.get(detRole);

    // Attempt to fetch detention channel
    let detChan = await this.client.handlers.db.get("detention", `${message.guild.id}-${detUser.id}`);
    if (!detChan) return message.reply(`${detUser.tag} is not currently detentioned.`);

    // Remove detention role
    detMember.roles.remove(detRole);

    // Fetch and format detention channel messages
    detChan = message.guild.channels.get(detChan["data"]);
    let muteChanMsg = await this.client.getChanMsg(detChan);
    muteChanMsg = muteChanMsg
      .map(m => `${moment(m.createdAt).format("dddd MMMM Do, YYYY, hh:mm A")} | ${m.author.tag} (${m.author.id}):\n${m.content}`)
      .join("\n\n=-= =-= =-= =-= =-=\n\n");

    // Upload formatted string to hastebin
    const hastebinURL = await this.client.hastebin(muteChanMsg);

    // Check if the guild has a logs channel
    if (gSettings["modlogschannel"] && message.guild.channels.get(gSettings["modlogschannel"])) {
      const logsChan = message.guild.channels.get(gSettings["modlogschannel"]);

      const embed = new MessageEmbed()
        .setAuthor(`${detUser.tag} (${detUser.id})`, detUser.displayAvatarURL())
        .setDescription("Detention Ended")
        .addField("Hastebin Link", hastebinURL, false);

      logsChan.send({ embed });
    }

    // Append detention record to affected user's mod notes DB entry
    this.client.handlers.modNotes.addAction(message, detUser, message.author, "Detention", `${match[2]}${hastebinURL ? `\n${hastebinURL}` : ""}`);

    // Delete the detention channel and DB entry
    await detChan.delete(`${message.author.tag} removed ${detUser.tag} from detention`);
    await this.client.handlers.db.delete("detention", `${message.guild.id}-${detUser.id}`);

    return message.reply(`${detUser.tag} has been removed from detention`);
  }
};