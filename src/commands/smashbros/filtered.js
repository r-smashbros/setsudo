const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "filtered",
      aliases: [],
      ltu: client.constants.perms.user,
      selfhost: false
    });
  }

  /**
   * Entry point for filtered command
   * @param {Message} message The message that invoked the command
   * @returns {Message} The response to the command
   */
  async execute(message) {
      return message.author.send(await this.client.handlers.autoMod.listWords(message));
  }
};