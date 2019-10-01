const Command = require('../../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "detention",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    const gSettings = this.client.db.settings.get(message.guild.id);

    let detCat = gSettings['detentioncategory'];
    let detRole = gSettings['detentionrole'];

    const user = /(\d{17,20})/.exec(message.content);

    if (!detCat || !message.guild.channels.get(detCat)) return message.reply('The detention category is either not set or no longer exists.');
    if (!detRole || !message.guild.roles.get(detRole)) return message.reply('The detention role is either not set or no longer exists');
    if (!user || !message.guild.members.get(user[1])) return message.reply('Either a user was not supplied, or the user is no longer a member of the guild.');

    const detUser = this.client.users.get(user[1]);
    const detMember = await message.guild.members.fetch(user[1]);
    detRole = message.guild.roles.get(detRole);

    if (this.client.db.detention.get(`${message.guild.id}-${detUser.id}`)) return message.reply(`${detUser.tag} is already detentioned`);

    detCat = message.guild.channels.get(detCat);

    detMember.roles.add(detRole);

    const detChan = await message.guild.channels.create(
      `detention-${detUser.username.replace(/\s/, '-')}`,
      {
        parent: detCat,
        reason: `${message.author.tag} detentioned ${detUser.tag}`,
        type: 0
      }
    );

    detChan.updateOverwrite(detUser.id, {
      VIEW_CHANNEL: true
    });

    await detUser.send({ embed: this.client.constants.embedTemplates.dm(message, "Detentioned", `<#${detChan.id}>`) })
      .catch(() => message.reply('Unable to DM user.'));

    let logsChan = this.client.db.settings.get(message.guild.id, "logschannel");
    if (logsChan && message.guild.channels.get(logsChan)) {
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, detUser, "Detention", "N/A") });
    }

    this.client.db.detention.set(`${message.guild.id}-${detUser.id}`, detChan.id);
    this.client.handlers.modNotes.addAction(message, user, message.author, "Detention", "Ask Moderator");

    return message.reply(`${detUser.tag} has been detentioned.`);
  }
};