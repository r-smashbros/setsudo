const Command = require('../../structures/command.js');
const { Collection, MessageEmbed } = require('discord.js');
const { inspect } = require('util');

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

    this.client.db.activityStats.forEach(async (v, k) => {
      const user = await this.client.users.fetch(k);
      aStr += `${user.tag}: ${v['actions']}\n`;
      mStr += `${user.tag}: ${v['messages']}\n`;
    });

    const vStats = await this.getVoteUsers();

    for (const [k, v] of Object.entries(vStats)) {
      const user = await this.client.users.fetch(k);
      vStr += `${user.tag}: ${v}\n`;
    }

    const aEmbed = new MessageEmbed().setTitle("Moderator Action Activity").setDescription(aStr).setColor(0xFF0000);
    const mEmbed = new MessageEmbed().setTitle("Moderator Message Activity").setDescription(mStr).setColor(0x00FF00);
    const vEmbed = new MessageEmbed().setTitle("Moderator Vote Participation").setDescription(vStr).setColor(0x0000FF).setTimestamp();

    await message.channel.send({ embed: aEmbed });
    await message.channel.send({ embed: mEmbed });
    await message.channel.send({ embed: vEmbed });

    if (!keepStats) this.client.db.activityStats.deleteAll();
  }

  getVoteUsers() { 
    return new Promise(async (res, rej) => {
      let rUsers = {};

      const voteChan = this.client.guilds.get(this.client.config['servSpec']['modServ']).channels.get(this.client.config['servSpec']['voteChan']);
      let voteMsg = await voteChan.messages.fetch({ limit: 100 });
      voteMsg = voteMsg.filter(m => m.createdTimestamp > Date.now() - 1209600000 && m.reactions.size);

      for (const msg of voteMsg.values()) {
        for (const r of msg.reactions.values()){
          const _rUsers = await r.users.fetch();

          for (const u of _rUsers.values()) {
            if (u.id === this.client.id) continue;
            if (!rUsers[u.id]) rUsers[u.id] = 0;
            rUsers[u.id] += 1;
          }
        }
      }

      // Sort voting participation
      const _rUsers = [];
      for (const key in rUsers) _rUsers.push([key, rUsers[key]]);
      _rUsers.sort((a, b) => b[1] - a[1]);
      rUsers = {};
      for (const entry of _rUsers) rUsers[entry[0]] = entry[1];

      res(rUsers);
    });
  }
};