const Command = require("../../structures/command.js");
const { MessageEmbed } = require("discord.js");

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
    const clearStats = /--clear/.test(message.content);

    let aStr = "";
    const aObj = {}, aArr = [];
    let mStr = "";
    const mObj = {}, mArr = [];
    let vStr = "";

    this.client.db.activityStats.forEach((v, k) => {
      aArr.push([k, v["actions"]]);
      mArr.push([k, v["messages"]]);

      //const user = await this.client.users.fetch(k);
      //aStr += `${user.tag}: ${v["actions"]}\n`;
      //mStr += `${user.tag}: ${v["messages"]}\n`;
    });

    // Sort action and message counts
    aArr.sort((a, b) => b[1] - a[1]);
    mArr.sort((a, b) => b[1] - a[1]);
    for (const entry of aArr) aObj[entry[0]] = entry[1];
    for (const entry of mArr) mObj[entry[0]] = entry[1];
    for (const [k, v] of Object.entries(aObj)) {
      const user = await this.client.users.fetch(k);
      aStr += `${user.tag}:: ${v}\n`;
    }
    for (const [k, v] of Object.entries(mObj)) {
      const user = await this.client.users.fetch(k);
      mStr += `${user.tag}:: ${v}\n`;
    }

    const vStats = await this.getVoteUsers();

    for (const [k, v] of Object.entries(vStats)) {
      const user = await this.client.users.fetch(k);
      vStr += `${user.tag}:: ${v}\n`;
    }

    const aEmbed = new MessageEmbed().setTitle("Action Activity").setDescription(`\`\`\`asciidoc\n${aStr}\`\`\``).setColor(0xFF0000);
    const mEmbed = new MessageEmbed().setTitle("Message Activity").setDescription(`\`\`\`asciidoc\n${mStr}\`\`\``).setColor(0x00FF00);
    const vEmbed = new MessageEmbed().setTitle("Missed Votes").setDescription(`\`\`\`asciidoc\n${vStr}\`\`\``).setColor(0x0000FF).setTimestamp();

    await message.channel.send({ embed: aEmbed });
    await message.channel.send({ embed: mEmbed });
    await message.channel.send({ embed: vEmbed });

    if (clearStats) this.client.db.activityStats.deleteAll();
  }

  getVoteUsers() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      let rUsers = {};

      const voteChan = this.client.guilds.get(this.client.config["servSpec"]["modServ"]).channels.get(this.client.config["servSpec"]["voteChan"]);
      let voteMsg = await voteChan.messages.fetch({ limit: 100 });
      voteMsg = voteMsg.filter(m => m.createdTimestamp > Date.now() - 1209600000 && m.reactions.size);

      for (const msg of voteMsg.values()) {
        for (const r of msg.reactions.values()) {
          const _rUsers = await r.users.fetch();

          for (const u of _rUsers.values()) {
            if (u.id === this.client.user.id) continue;
            if (!rUsers[u.id]) rUsers[u.id] = 0;
            rUsers[u.id] += 1;
          }
        }
      }

      for (const val of Object.keys(rUsers)) { 
        if (rUsers[val] >= voteMsg.size) { rUsers[val] = 0; continue; }
        rUsers[val] = voteMsg.size - rUsers[val];
      }

      // Sort missing voting participation
      const _rUsers = [];
      for (const key in rUsers) _rUsers.push([key, rUsers[key]]);
      _rUsers.sort((a, b) => b[1] - a[1]);
      rUsers = {};
      for (const entry of _rUsers) rUsers[entry[0]] = entry[1];

      resolve(rUsers);
    });
  }
};