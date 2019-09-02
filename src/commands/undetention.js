const Command = require('../structures/command.js');
const moment = require('moment');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "undetention",
      aliases: [],
      ltu: client.constants.perms.staff
    });
  }

  async execute(message) {
    const gSettings = this.client.db.settings.get(message.guild.id);

    let detRole = gSettings['detentionrole'];

    const user = /(\d{17,20})/.exec(message.content);

    if (!detRole || !message.guild.roles.get(detRole)) return message.reply('The detention role is either not set or no longer exists');
    // TODO: Handle if user left server before detention ended
    if (!user || !message.guild.members.get(user[1])) return message.reply('Either a user was not supplied, or the user is no longer a member of the guild.');

    const detUser = this.client.users.get(user[1]);
    const detMember = message.guild.members.get(user[1]);
    detRole = message.guild.roles.get(detRole);

    let detChan = this.client.db.detention.get(`${message.guild.id}-${detUser.id}`);
    if (!detChan) return message.reply(`${detUser.tag} is not currently detentioned.`);

    detMember.roles.remove(detRole);

    detChan = message.guild.channels.get(detChan);

    if (gSettings['logschannel'] && message.guild.channels.get(gSettings['logschannel'])) {
      const logsChan = message.guild.channels.get(gSettings['logschannel']);

      let muteChanMsg = await this.client.getChanMsg(detChan);
      muteChanMsg = muteChanMsg
        .map(m => `${moment(m.createdAt).format("dddd MMMM Do, YYYY, hh:mm A")} | ${m.author.tag} (${m.author.id}):\n${m.content}`)
        .join("\n\n=-= =-= =-= =-= =-=\n\n");

      const embed = new MessageEmbed()
        .setAuthor(`${detUser.tag} (${detUser.id})`, detUser.displayAvatarURL())
        .setDescription("Detention Ended")
        .addField("Hastebin Link", await this.client.hastebin(muteChanMsg), false);

      logsChan.send({ embed });
    }

    await detChan.delete(`${message.author.tag} removed ${detUser.tag} from detention`);

    this.client.db.detention.delete(`${message.guild.id}-${detUser.id}`);

    return message.reply(`${detUser.tag} has been removed from detention`);
  }
};