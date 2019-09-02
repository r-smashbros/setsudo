const Command = require('../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "pingable",
      aliases: [],
      ltu: client.constants.perms.staff
    });
  }

  async execute(message) {
    const input = /(?:pingable)\s+(.+)/.exec(message.content);
    if (!input) return message.reply("No role specified");

    const role = message.guild.roles.get(input[1]) || message.guild.roles.find(r => r.name === input[1]);
    if (!role) return message.reply("The specified role is not valid.");

    role.setMentionable(true, `${message.author.tag} set ${role.name} mentionable`).then(r => {
      setTimeout(() => {
        r.setMentionable(false);
      }, 5 * 1000);
    });

    message.reply(`${role.name} is mentionable for 5 seconds.`);
  }
};