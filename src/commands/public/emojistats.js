const Command = require("../../structures/command.js");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "emojistats",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    const sorted = new Map([...this.client.db.emojiStats.entries()].sort((a, b) => b[1] - a[1]));
    let embed = `\`\`\`asciidoc\n= Emoji Stats for r/smashbros\n`;
    sorted.forEach((usageCount, emojiID) => {
      const emoji = message.guild.emojis.get(emojiID);
      const emojiList = message.guild.emojis.map(e => e.name);
      if (emoji) embed += `${emoji.name}${" ".repeat(Math.max(...(emojiList.map(el => el.length))) - emoji.name.length + 1)}:: ${usageCount.toLocaleString()} usages\n`;
    });
    embed += `\`\`\``;
    message.channel.send(embed, { split: true });
  }
};
