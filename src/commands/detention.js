const Command = require('../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "detention",
      aliases: [],
      ltu: client.constants.perms.staff
    });
  }

  async execute(message) {
    const match = /(?:detention)\s(start|end)/.exec(message.content);
    if (!match) return message.reply("Action not specified: `start` or `end`");

    const gSettings = this.client.db.settings.get(message.guild.id);
    
    let detCat = gSettings['detentioncategory'];
    let muteRole = gSettings['mutedrole'];

    let user = /(\d{17,20})/.exec(message.content);
    
    if (!detCat || !message.guild.channels.get(detCat)) return message.reply('The detention channel is either not set or no longer exists.');
    if (!muteRole || !message.guild.roles.get(muteRole)) return message.reply('The muted role is either not set or no longer exists');
    // TODO: Handle if user left server before detention ended
    if (!user || !message.guild.members.get(user[1])) return message.reply('Either a user was not supplied, or the user is no longer a member of the guild.');
    
    const detUser = this.client.users.get(user[1]);
    const detMember = message.guild.members.get(user[1]);
    muteRole = message.guild.roles.get(muteRole);

    if (match[1] === "start") {
      if (this.client.db.detention.get(`${message.guild.id}-${detUser.id}`)) return message.reply(`${detUser.tag} is already detentioned`);

      detCat = message.guild.channels.get(detCat);

      detMember.roles.add(muteRole);

      const detChan = await message.guild.channels.create(
        `detention-${detUser.username.replace(/\s/, '-')}`,
        {
          parent: detCat,
          reason: `${message.author.tag} detentioned ${detUser.tag}`
        }
      );

      detChan.updateOverwrite(detUser.id, {
        VIEW_CHANNEL: true
      });

      this.client.db.detention.set(`${message.guild.id}-${detUser.id}`, detChan.id);

      return message.reply(`${detUser.tag} has been detentioned.`);
    }

    if (match[1] === "end") { 
      let detChan = this.client.db.detention.get(`${message.guild.id}-${detUser.id}`);
      if (!detChan) return message.reply(`${detUser.tag} is not currently detentioned.`);

      detMember.roles.remove(muteRole);
      
      detChan = message.guild.channels.get(detChan);
      await detChan.delete(`${message.author.tag} removed ${detUser.tag} from detention`);
      
      this.client.db.detention.delete(`${message.guild.id}-${detUser.id}`);
      
      return message.reply(`${detUser.tag} has been removed from detention`);
    }
  }
};