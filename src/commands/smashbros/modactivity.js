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

    this.client.db.activityStats.forEach(async (v, k) => {
      const user = await this.client.users.fetch(k);
      aStr += `${user.tag}: ${v['actions']}\n`;
      mStr += `${user.tag}: ${v['messages']}\n`;
    });

    const voteChan = this.client.guilds.get(this.client.config['servSpec']['modServ']).channels.get(this.client.config['servSpec']['voteChan']);
    let voteMsg = await voteChan.messages.fetch({ limit: 100 });
    voteMsg = voteMsg.filter(m => m.createdTimestamp > Date.now() - 1209600000 && m.reactions.size);
    voteMsg.forEach(msg => msg.reactions.forEach(async r => {
      const rUsers = await r.fetch();
      rUsers.forEach(u => {
        vStats[u.id] = vStats[u.id] + 1 || 1;
      });
    }));

    for (const [k, v] of Object.entries(vStats)) {
      const user = await this.client.users.fetch(k);
      vStr += `${user.tag}: ${v}\n`;
    }

    const embed = new MessageEmbed()
      .setTitle("Moderator Activity Stats")
      .addField("Action Activity", aStr + "test", false)
      .addField("Mod Message Activity", mStr + "test", false)
      .addField("Vote Participation", vStr + "test", false)
      .setTimestamp()
      .setColor(0x36393F);

    message.channel.send({ embed });

    if (!keepStats) this.client.db.activityStats.deleteAll();
  }
};