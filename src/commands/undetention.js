const Command = require('../structures/command.js');

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

    let muteRole = gSettings['mutedrole'];

    const user = /(\d{17,20})/.exec(message.content);

    if (!muteRole || !message.guild.roles.get(muteRole)) return message.reply('The muted role is either not set or no longer exists');
    // TODO: Handle if user left server before detention ended
    if (!user || !message.guild.members.get(user[1])) return message.reply('Either a user was not supplied, or the user is no longer a member of the guild.');

    const detUser = this.client.users.get(user[1]);
    const detMember = message.guild.members.get(user[1]);
    muteRole = message.guild.roles.get(muteRole);

    let detChan = this.client.db.detention.get(`${message.guild.id}-${detUser.id}`);
    if (!detChan) return message.reply(`${detUser.tag} is not currently detentioned.`);

    detMember.roles.remove(muteRole);

    detChan = message.guild.channels.get(detChan);
    await detChan.delete(`${message.author.tag} removed ${detUser.tag} from detention`);

    this.client.db.detention.delete(`${message.guild.id}-${detUser.id}`);

    return message.reply(`${detUser.tag} has been removed from detention`);
  }
};