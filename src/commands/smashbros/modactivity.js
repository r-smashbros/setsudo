const Command = require('../../structures/command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "modactivity",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: false
    });
  }

  async execute(message) {
    const keepStats = /--keep/.test(message.content);

    let aStr = "";
    let mStr = "";
    let vStr = "";

    const vStats = {};

    this.client.db.activityStats.forEach((v, k) => {
      const user = this.client.users.fetch(k);
      aStr += `${user.tag}: ${v['actions']}\n`;
      mStr += `${user.tag}: ${v['messages']}\n`;
    });

    const voteChan = this.client.guilds.get(this.client.config['serverSpec']['modServ']).channels.get(this.client.config['serverSpec']['voteChan']);
    let voteMsg = await voteChan.messages.fetch({ limit: 100 });
    voteMsg = voteMsg.filter(m => m.createdTimestamp > Date.now() - 1209600000 && m.reactions.size);
    voteMsg.forEach((msg) => msg.reactions.forEach(r => r.users.forEach(u => {
      vStats[u.id] = vStats[u.id] + 1 || 1;
    })));

    for (const [k, v] of Object.entries(vStats)) {
      const user = this.client.users.fetch(k);
      vStr += `${user.tag}: ${v}\n`;
    }

    const embed = new MessageEmbed()
      .setTitle("Moderator Activity Stats")
      .addField("Action Activity", aStr, false)
      .addField("Mod Message Activity", mStr, false)
      .addField("Vote Participation", vStr, false)
      .setTimestamp()
      .setColor(0x36393F);
    
    message.channel.send({ embed });

    if (!keepStats) this.client.db.activityStats.deleteAll();
  }
};