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

  /**
   * Entry point for emojistats command
   * @param {Message} message The message that invoked the command
   */
  async execute(message) {
    // Sort emojistats DB in descending order
    const sorted = new Map([...this.client.db.emojiStats.entries()].sort((a, b) => b[1] - a[1]));

    let msg = `\`\`\`asciidoc\n= Emoji stats for ${message.guild.name}\n`;
    
    // Loop over each emoji
    sorted.forEach((usageCount, emojiID) => {
      // Fetch emoji
      const emoji = message.guild.emojis.get(emojiID);

      const emojiList = message.guild.emojis.map(e => e.name);

      // Template emoji stats and append to string
      if (emoji) msg += `${emoji.name}${" ".repeat(Math.max(...(emojiList.map(el => el.length))) - emoji.name.length + 1)}:: ${usageCount.toLocaleString()} usages\n`;
    });
    msg += `\`\`\``;

    // Send stats split across multiple messages with proper formatting
    message.channel.send(msg, { split: { prepend: "```asciidoc\n", append: "```" } });
  }
};
