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

  /**
   * Entry point for modactivity command
   * @param {Message} message The message that invoked the command
   */
  async execute(message) {
    // Check to see if the stats need to be cleared after execution
    const clearStats = /--clear/.test(message.content);

    let aStr = "";
    const aObj = {}, aArr = [];
    let mStr = "";
    const mObj = {}, mArr = [];
    let vStr = "";
    let cStr = "";
    const cObj = {}, cArr = [];

    let activityStats = await this.client.handlers.db.get("activitystats");
    activityStats = activityStats.map(entry => [ entry["id"], entry["data"]]);

    // Loop over each entry in the activityStats DB
    activityStats.forEach(entry => {
      // Separate actions, closed modmails, and messages for sorting
      aArr.push([entry[0], entry[1]["actions"]]);
      mArr.push([entry[0], entry[1]["messages"]]);
      cArr.push([entry[0], entry[1]["closes"]]);
    });

    // Sort action, closed modmails, and message counts
    aArr.sort((a, b) => b[1] - a[1]);
    mArr.sort((a, b) => b[1] - a[1]);
    cArr.sort((a, b) => b[1] - a[1]);

    // Restore action, closed modmails, and message counts to objects from arrays
    for (const entry of aArr) aObj[entry[0]] = entry[1];
    for (const entry of mArr) mObj[entry[0]] = entry[1];
    for (const entry of cArr) cObj[entry[0]] = entry[1];

    // Loop over action, closed modmails, and message stats and append to strings
    for (const [k, v] of Object.entries(aObj)) {
      const user = await this.client.users.fetch(k);
      aStr += `${user.tag}:: ${v}\n`;
    }
    for (const [k, v] of Object.entries(mObj)) {
      const user = await this.client.users.fetch(k);
      mStr += `${user.tag}:: ${v}\n`;
    }
    for (const [k, v] of Object.entries(cObj)) {
      const user = await this.client.users.fetch(k);
      cStr += `${user.tag}:: ${v}\n`;
    }

    // Fetch voting statistics
    const vStats = await this._getVoteUsers();

    // Loop over vote stats and append to string
    for (const [k, v] of Object.entries(vStats)) {
      const user = await this.client.users.fetch(k);
      vStr += `${user.tag}:: ${v}\n`;
    }

    // Construct and send action, closed modmails, message, and missed votes embeds
    const aEmbed = new MessageEmbed().setTitle("Action Activity").setDescription(`\`\`\`asciidoc\n${aStr}\`\`\``).setColor(0xFF0000);
    const mEmbed = new MessageEmbed().setTitle("Message Activity").setDescription(`\`\`\`asciidoc\n${mStr}\`\`\``).setColor(0x00FF00);
    const vEmbed = new MessageEmbed().setTitle("Missed Votes").setDescription(`\`\`\`asciidoc\n${vStr}\`\`\``).setColor(0x0000FF);
    const cEmbed = new MessageEmbed().setTitle("Modmails Closed").setDescription(`\`\`\`asciidoc\n${cStr}\`\`\``).setColor(0x00FFFF);

    await message.channel.send({ embed: aEmbed });
    await message.channel.send({ embed: mEmbed });
    await message.channel.send({ embed: vEmbed });
    await message.channel.send({ embed: cEmbed });

    // Clear stats if the "--clear" flag was present
    if (clearStats) await this.client.handlers.db.deleteAll("activitystats");
  }

  /**
   * Fetch all votes within a two week time frame and return number of missed votes
   * @private
   */
  _getVoteUsers() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      let rUsers = {};

      // Fetch votes and filter out messages older than two weeks and without reactions
      const voteChan = this.client.guilds.get(this.client.config["servSpec"]["modServ"]).channels.get(this.client.config["servSpec"]["voteChan"]);
      let voteMsg = await voteChan.messages.fetch({ limit: 100 });
      voteMsg = voteMsg.filter(m => m.createdTimestamp > Date.now() - 1209600000 && m.reactions.size);

      // Loop over each vote
      for (const msg of voteMsg.values()) {
        // Loop over each reaction on a vote
        for (const r of msg.reactions.values()) {
          // Fetch the users who reacted
          const _rUsers = await r.users.fetch();

          // Loop over each user who reacted
          for (const u of _rUsers.values()) {
            if (u.id === this.client.user.id) continue;
            if (!rUsers[u.id]) rUsers[u.id] = 0;
            rUsers[u.id] += 1;
          }
        }
      }

      // Subtract number of reactions from number of messages
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