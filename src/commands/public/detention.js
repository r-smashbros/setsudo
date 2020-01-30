const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "detention",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  /**
   * Entry point for the detention command
   * @param {Message} message The message that invoked the command
   * @returns {Message} The response to the command
   */
  async execute(message) {
    const gSettings = this.client.db.settings.get(message.guild.id);

    let detCat = gSettings["detentioncategory"];
    let detRole = gSettings["detentionrole"];

    const user = /(\d{17,20})/.exec(message.content);

    // Check for detention category, detention role, and affected user
    if (!detCat || !message.guild.channels.get(detCat)) return message.reply("The detention category is either not set or no longer exists.");
    if (!detRole || !message.guild.roles.get(detRole)) return message.reply("The detention role is either not set or no longer exists");
    if (!user || !message.guild.members.get(user[1])) return message.reply("Either a user was not supplied, or the user is no longer a member of the guild.");

    // Fetch detention user, corresponding GuildMember instance, and detention role
    const detUser = this.client.users.get(user[1]);
    const detMember = await message.guild.members.fetch(user[1]);
    detRole = message.guild.roles.get(detRole);

    // Prevent the user from being detentioned twice
    if (this.client.db.detention.get(`${message.guild.id}-${detUser.id}`)) return message.reply(`${detUser.tag} is already detentioned`);

    detCat = message.guild.channels.get(detCat);

    detMember.roles.add(detRole);

    // Create detention channel
    const detChan = await message.guild.channels.create(
      `detention-${detUser.id}`,
      {
        parent: detCat,
        reason: `${message.author.tag} detentioned ${detUser.tag}`,
        type: "text"
      }
    );

    // Allow detentioned user to see detention channel
    detChan.updateOverwrite(detUser.id, {
      VIEW_CHANNEL: true
    });

    // DM affected user that they were detentioned if possible
    await detUser.send({ embed: this.client.constants.embedTemplates.dm(message, "Detentioned", `<#${detChan.id}>`) })
      .catch(() => message.reply('Unable to DM user.'));

    // Check if guild has logs channel
    let logsChan = this.client.db.settings.get(message.guild.id, "modlogschannel");
    if (logsChan && message.guild.channels.get(logsChan)) {
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, detUser, "Detention", "N/A") });
    }

    // Store detention information in appropriate DB
    this.client.db.detention.set(`${message.guild.id}-${detUser.id}`, detChan.id);

    return message.reply(`${detUser.tag} has been detentioned.`);
  }
};