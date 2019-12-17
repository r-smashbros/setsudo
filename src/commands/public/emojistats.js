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
    let embedDescription = "";
    sorted.forEach((usageCount, emojiID) => {
      let emojiName = message.guild.emojis.get(emojiID).name;
      embedDescription += `<:${emojiName}:${emojiID}> \`${emojiName}: ${usageCount.toLocaleString()} usages\` \n`;
    });
    const embed = new MessageEmbed().setTitle("Emoji Stats").setDescription(`${embedDescription}`).setColor(0x00FFFF);
    await message.channel.send({ embed: embed });
  }
};