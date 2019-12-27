const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "automod",
      aliases: ["am"],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    const addRegex = /(?:add)(?:\s+([\w\W]+))/.exec(message.content);
    const removeRegex = /(?:remove)(?:\s+(\d+))/.exec(message.content);
    const listRegex = /(?:list)/.exec(message.content);

    if (!addRegex && !removeRegex && !listRegex) {
      let toReturn = "";
      toReturn += "Invalid Command Usage\n";
      toReturn += "```asciidoc\n";
      toReturn += "= Command Syntax\n";
      toReturn += `*:: ${this.client.config["discord"]["prefix"]}automod <add|remove|list> [term|term-number]\n`;
      toReturn += "= Command Examples\n";
      toReturn += `*:: ${this.client.config["discord"]["prefix"]}automod add arse\n`;
      toReturn += `*:: ${this.client.config["discord"]["prefix"]}automod remove 1\n`;
      toReturn += `*:: ${this.client.config["discord"]["prefix"]}automod list`;
      toReturn += "```";

      return message.channel.send(toReturn);
    }

    if (addRegex) {
      return this.client.handlers.autoMod.addWord(message, addRegex[1])
        .then(() => message.channel.send(`${addRegex[1]} has been added to the automod list`))
        .catch(e => message.channel.send(`ERR: ${e}`));
    } else if (removeRegex) {
      return this.client.handlers.autoMod.removeWord(message, removeRegex[1])
        .then(() => message.channel.send(`Entry ${removeRegex[1]} has been removed from the automod list`))
        .catch(e => message.channel.send(`ERR: ${e}`));
    } else {
      return message.channel.send(await this.client.handlers.autoMod.listWords(message));
    }
  }
};