const Command = require('../../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "starboard",
      aliases: ["sb"],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    // This is black magic fuckery for unicode emoji handling. Touch it and everything breaks
    const addRegex = /(?:add)(?:\s+(?:<#)?(\d{17,20})(?:>)?)(?:\s+(\\?)(?:(?:<a?:)(\w+)(?::)(\d+)(?:>)|([\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}])))(?:\s+(\d+))/u
      .exec(message.content);
    const removeRegex = /(?:remove)(?:\s+(?:<#)?(\d{17,20})(?:>)?)/.exec(message.content);
    const listRegex = /(?:list)/.exec(message.content);

    if (!addRegex && !removeRegex && !listRegex) {
      let toReturn = "";
      toReturn += "Invalid Command Usage\n";
      toReturn += "```asciidoc\n";
      toReturn += "= Command Syntax\n";
      toReturn += `*:: ${this.client.config['discord']['prefix']}starboard add <channel-id/mention> <emoji> <limit>\n`;
      toReturn += `*:: ${this.client.config['discord']['prefix']}starboard remove <channel-id/mention>\n`;
      toReturn += `*:: ${this.client.config['discord']['prefix']}starboard list\n`;
      toReturn += "= Command Examples\n";
      toReturn += `*:: ${this.client.config['discord']['prefix']}starboard add #starboard ⭐ 5\n`;
      toReturn += `*:: ${this.client.config['discord']['prefix']}starboard remove #starboard\n`;
      toReturn += `*:: ${this.client.config['discord']['prefix']}starboard list`;
      toReturn += "```";

      return message.channel.send(toReturn);
    }

    if (addRegex) {
      if (!message.guild.channels.get(addRegex[1])) return message.channel.send("ERR: Invalid channel ID given.");
      if (!addRegex[2]) return message.channel.send("Emoji must be escaped when using this comamnd. Add a `\\` in front of the emoji and try again.");
      
      return this.client.handlers.starboard.addSB(message, addRegex[1], !!addRegex[5], addRegex[3], addRegex[4], addRegex[6])
        .then(() => message.channel.send("Starboard added!"))
        .catch(e => message.channel.send(`ERR: ${e}`));
    } else if (removeRegex) {
      return this.client.handlers.starboard.removeSB(message, removeRegex[1])
        .then(() => message.channel.send("Starboard removed!"))
        .catch(e => message.channel.send(`ERR: ${e}`));
    } else {
      return message.channel.send(await this.client.handlers.starboard.listServerSB(message));
    }
  }
};