const Event = require("../structures/event.js");
const { Collection, MessageEmbed } = require("discord.js");
module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "message"
    });

    this.permissions = new (require("../handlers/permission.js"))();
  }

  /**
   * Entry point for message event
   * @param {Message} ctx The message to be processed
   */
  async execute(ctx = null) {

    // Filter out other bots and DM channels
    if (ctx.author.bot) return;
    if (ctx.channel.type !== "text") return;

    // Create guild settings if they don't exist
    if (!this.client.db.settings.has(ctx.guild.id)) this.client.db.settings.set(ctx.guild.id, this.client.constants.defaultSettings);

    // Check for automod violations
    await this.autoModCheck(ctx);

    // [SH] Handle r/smashbros related data
    if (!this.client.config["selfhost"]) {

      // Mod Stats
      if (
        ctx.guild.id === this.client.config["servSpec"]["modServ"] &&
        (ctx.channel.parent.id === this.client.config["servSpec"]["modCat"] || ctx.channel.parent.id === this.client.config["servSpec"]["voteCat"])
      ) {
        if (!this.client.db.activityStats.has(ctx.author.id))
          this.client.db.activityStats.set(ctx.author.id, { "actions": 0, "messages": 1 });
        else this.client.db.activityStats.inc(ctx.author.id, "messages");
      }

      // Focused Opt-In
      if (ctx.channel.id === "637828052050509835") {
        if (ctx.content.toLowerCase() === "i agree") ctx.member.roles.add(ctx.guild.roles.get("638120671368445953"));
        return ctx.delete();
      }
    }

    // Check for emoji usage and increment usage value if required
    const emojiRegex = /(?:<a?:)(\w+)(?::)(\d+)(?:>)/g;
    let emojiArray;
    while ((emojiArray = emojiRegex.exec(ctx.content))) {
      if (!ctx.guild.emojis.has(emojiArray[2])) continue;

      if (!this.client.db.emojiStats.has(emojiArray[2])) this.client.db.emojiStats.set(emojiArray[2], 1);
      else this.client.db.emojiStats.set(emojiArray[2], Number(this.client.db.emojiStats.get(emojiArray[2])) + 1);
    }

    // Check if message starts with prefix and slice it off if so
    if (!ctx.content.startsWith(this.client.config["discord"]["prefix"])) return;
    const content = ctx.content.slice(this.client.config["discord"]["prefix"].length);

    // Fetch the command with the provided name or return if not available
    const command = await this.fetchCommand(content.split(" ")[0]);
    if (!command) return;

    // Get permission information for the command user and reject if permission level is too low
    // eslint-disable-next-line require-atomic-updates
    ctx.perm = this.checkPerm(ctx);
    if (command.ltu > ctx.perm[0]) return;

    // Prevent execution of r/smashbros commands if the bot is self-hosted
    if (!command.selfhost && this.client.config["selfhost"]) return;

    return command.execute(ctx);
  }

  /**
   * Fetches commands by name
   * @param {string} text Command name
   * @returns {Promise<Command>|Promise<>} If the command is found, the promise will resolve with the class. Otherwise, it will resolve empty.
   */
  fetchCommand(text) {
    return new Promise((resolve, reject) => {
      if (this.client.commands.has(text)) return resolve(this.client.commands.get(text));
      this.client.commands.forEach(c => { if (c.aliases && c.aliases.includes(text)) return resolve(c); });
      return resolve();
    });
  }

  /**
   * Fetches the permission level for the message author
   * @param {Message} message The message to be processed
   * @returns {array} Permission level data
   */
  checkPerm(message) {
    return this.permissions.fetch(this.client, message);
  }

  /**
   * 
   * @param {Message} message The message to be processed
   */
  async autoModCheck(message) {
    const gSettings = this.client.db.settings.get(message.guild.id);

    // Check if guild has anything in its automod list
    if (gSettings["automodlist"] && gSettings["automodlist"].length) {

      // Loop over each automod entry
      for (const term of gSettings["automodlist"]) {

        // Construct and test regex to search for banned term
        const checkRegex = new RegExp(`\\b${term}\\b`, "i");
        if (checkRegex.test(message.content)) {

          // Fetch messages near the violation for context
          let nearMsgs = await message.channel.messages.fetch({ limit: 5 });

          // Reverse the order of the fetched messages to be oldest to newest
          nearMsgs = new Collection([...nearMsgs].reverse());

          await message.delete();

          // Check if the guild has a channel to log automod violations in
          if (gSettings["automodchannel"] && message.guild.channels.get(gSettings["automodchannel"])) {
            const amChan = message.guild.channels.get(gSettings["automodchannel"]);

            // Create automod violation embed
            const embed = new MessageEmbed()
              .setDescription(`**Potential trouble found in <#${message.channel.id}>**`)
              .setColor(this.client.constants.colours.info)
              .setTimestamp();

            for (const m of nearMsgs.values()) {
              embed.addField(`${m.author.tag} (${m.author.id})`, m.content.replace(term, `__**${term}**__`), false);
            }

            amChan.send({ embed });
          }
        }
      }
    }
  }
};
