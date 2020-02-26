const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "antiinvite",
      aliases: ["ai"],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  /**
   * Entry point for antiinvite command
   * @param {Message} message The message that invoked the command
   * @returns {Message} The response to the command
   */
  async execute(message) {
    const addRegex = /(?:add)(?:\s+([\w\W]+))/.exec(message.content);
    const removeRegex = /(?:remove)(?:\s+(\d+))/.exec(message.content);
    const listRegex = /(?:list)/.exec(message.content);

    // If no matching syntax is found, show help information
    if (!addRegex && !removeRegex && !listRegex) {
      let toReturn = "";
      toReturn += "Invalid Command Usage\n";
      toReturn += "```asciidoc\n";
      toReturn += "= Command Syntax\n";
      toReturn += `*:: ${this.client.config["discord"]["prefix"]}antiinvite <add|remove|list> [channel id|channel-number]\n`;
      toReturn += "= Command Examples\n";
      toReturn += `*:: ${this.client.config["discord"]["prefix"]}antiinvite add 553311497279897601\n`;
      toReturn += `*:: ${this.client.config["discord"]["prefix"]}antiinvite remove 1\n`;
      toReturn += `*:: ${this.client.config["discord"]["prefix"]}antiinvite list`;
      toReturn += "```";

      return message.channel.send(toReturn);
    }

    if (addRegex) {
      return this.client.handlers.antiInvite.addChannel(message, addRegex[1])
        .then(() => message.channel.send(`<#${addRegex[1]}> has been added to the whitelist`))
        .catch(e => message.channel.send(`ERR: ${e}`));
    } else if (removeRegex) {
      return this.client.handlers.antiInvite.removeChannel(message, removeRegex[1])
        .then(() => message.channel.send(`${removeRegex[1]} has been removed from the whitelist`))
        .catch(e => message.channel.send(`ERR: ${e}`));
    } else {
      return message.channel.send(await this.client.handlers.antiInvite.listChannels(message));
    }
  }
};