const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "pingable",
      aliases: [],
      ltu: client.constants.perms.helper,
      selfhost: true
    });
  }

  /**
   * Entry point for pingable command
   * @param {Message} message The message that invoked the command
   * @returns {Message} The response to the command
   */
  async execute(message) {
    const input = /(?:pingable)\s+(.+)/.exec(message.content);

    // Check if user can make any role mentionable and if the user specified a role
    if (
      !input &&
      // [SH] Make clause for Helper permission
      message.perm[0] > this.client.constants.perms.helper
    ) return message.reply("No role specified");

    // [SH] If user is a helper, automatically default to specific role
    if (message.perm[0] === this.client.constants.perms.helper) {
      const role = message.guild.roles.get("570303572692959233");
      if (!role) return message.reply("Cannot find Tournament News role.");

      role.setMentionable(true, `${message.author.tag} set ${role.name} mentionable`).then(r => {
        setTimeout(() => r.setMentionable(false), 10 * 1000);
      });

      return message.reply(`${role.name} is mentionable for 10 seconds.`);
    }

    // Fetch provided role or return error if unable
    const role = message.guild.roles.get(input[1]) || message.guild.roles.find(r => r.name === input[1]);
    if (!role) return message.reply("The specified role is not valid.");

    // Set the role to be mentionable for 10 seconds
    role.setMentionable(true, `${message.author.tag} set ${role.name} mentionable`).then(r => {
      setTimeout(() => r.setMentionable(false), 10 * 1000);
    });

    return message.reply(`${role.name} is mentionable for 10 seconds.`);
  }
};