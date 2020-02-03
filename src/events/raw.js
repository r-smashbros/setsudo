const Event = require("../structures/event.js");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "raw"
    });
  }

  /**
   * Entry point for raw event
   * @param {object} ctx Raw data
   */
  execute(ctx = null) {
    if (ctx.t === "MESSAGE_REACTION_ADD") return this._handleReaction(ctx, true);
    else if (ctx.t === "MESSAGE_REACTION_REMOVE") return this._handleReaction(ctx, false);
    else return;
  }

  /**
   * Handles new reaction data
   * @private
   * 
   * @param {object} data Raw data
   * @param {boolean} action Whether the event is a reaction add or remove
   */
  async _handleReaction(data, action) {
    const reaction = data.d;

    // Fetch reaction user
    const user = await this.client.users.fetch(reaction.user_id).catch(() => null);
    if (user === null) return;

    // Fetch reaction channel
    const channel = this.client.channels.get(reaction.channel_id);

    // Check if reaction channel is valid, of proper type, and is viewable to the bot
    if (!channel || channel.type !== "text" || channel.permissionsFor(this.client.user).has("VIEW_CHANNEL") === false) return;

    // Fetch reaction message
    const message = await channel.messages.fetch(reaction.message_id);

    // Fetch guild settings and check if the server has starboards
    const gSettings = await this.client.handlers.db.get("settings", message.guild.id);
    if (!Object.keys(gSettings["starboard"]).length) return;

    // Loop over guild starboards
    for (const [id, val] of Object.entries(gSettings["starboard"])) {

      // Check if the reaction matches either the stored ID or stored name for the starboard
      if (
        (val["emoji"]["unicode"] && reaction.emoji.name === val["emoji"]["name"]) ||
        (!val["emoji"]["unicode"] && reaction.emoji.id === val["emoji"]["id"])
      ) {
        if (await this.client.handlers.db.has("starboard", `${channel.id}-${message.id}`)) {
          const sbSet = await this.client.handlers.db.get("starboard", `${channel.id}-${message.id}`);
          return this._handleUpdate(message, id, val, sbSet["data"], action);
        } else return this._handleNew(message, id, val);
      }
    }
  }

  /**
   * Handles new starboard entry
   * @private
   * 
   * @param {Message} message Message that was reacted to
   * @param {string} sbChanID ID of guild's starboard channel
   * @param {object} sbSet Starboard object
   */
  async _handleNew(message, sbChanID, sbSet) {
    const emojiData = sbSet["emoji"];

    // Filter out extra/invalid emoji
    const reactions = message.reactions.filter(r => r._emoji.name === emojiData["name"]);

    // Check if the starboard reaction is present and above the required amount
    if (reactions.size < 1 || sbSet["limit"] > reactions.first().count) return;

    // Create starboard embed
    const embed = new MessageEmbed()
      .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL())
      .setFooter(message.channel.name)
      .setTimestamp()
      .setColor(0xffff00);

    if (message.content) embed.setDescription(message.content);
    if (message.attachments.size) embed.setImage(message.attachments.first().url);

    const sbChan = this.client.channels.get(sbChanID);

    // Send templated message in starboard channel
    const msg = await sbChan.send(
      `${emojiData["unicode"] ? emojiData["name"] : `<:${emojiData["name"]}:${emojiData["id"]}>`} ${sbSet["limit"]} <#${message.channel.id}> ID: ${message.id}`, { embed }
    );

    // Store the new starboard entry in the starboard DB
    await this.client.handlers.db.insert("starboard", {
      "id": `${message.channel.id}-${message.id}`,
      "data": {
        "sbEntryID": `${sbChanID}-${msg.id}`,
        "count": sbSet["limit"]
      }
    });

  }

  /**
   * Handles updating starboard entry
   * @private
   * 
   * @param {Message} message Message that was reacted to
   * @param {string} sbChanID ID of the starboard channel
   * @param {object} sbSet Starboard config object
   * @param {object} sbData Starboard data object
   * @param {boolean} action Whether the event is a reaction add or remove
   */
  async _handleUpdate(message, sbChanID, sbSet, sbData, action) {
    const emojiData = sbSet["emoji"];

    // Fetch starboard message 
    const msg = await this.client.channels.get(sbData["sbEntryID"].split("-")[0]).messages.fetch(sbData["sbEntryID"].split("-")[1]);

    // Filter out extra/invalid emoji
    const reactions = message.reactions.filter(r => r._emoji.name === emojiData["name"]);

    // Check if the starboard reaction is present and above the required amount
    if (reactions.size < 1 || sbSet["limit"] > reactions.first().count) {
      await this.client.handlers.db.delete("starboard", `${message.channel.id}-${message.id}`);
      return msg.delete();
    }

    // Increment or decrement depending on action
    action ? sbData["count"]++ : sbData["count"]--;

    // Create new starboard entry if the original one doesn't exist
    if (!msg) {

      // Create starboard embed
      const embed = new MessageEmbed()
        .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL())
        .setFooter(message.channel.name)
        .setTimestamp()
        .setColor(0xffff00);

      if (message.content) embed.setDescription(message.content);
      if (message.attachments.size) embed.setImage(message.attachments.first().url);

      const sbChan = this.client.channels.get(sbChanID);

      // Send templated message in starboard channel
      const msg = await sbChan.send(
        `${emojiData["unicode"] ? emojiData["name"] : `:${emojiData["name"]}:`} ${sbData["count"]} <#${message.channel.id}> ID: ${message.id}`, { embed }
      );

      // Store the new starboard entry in the starboard DB
      await this.client.handlers.db.insert("starboard", {
        "id": `${message.channel.id}-${message.id}`,
        "data": {
          "sbEntryID": `${sbChanID}-${msg.id}`,
          "count": sbSet["limit"]
        }
      });

      return;
    }

    // Update starboard message with proper reaction count
    msg.edit(`${emojiData["unicode"] ? emojiData["name"] : `<:${emojiData["name"]}:${emojiData["id"]}>`} ${sbData["count"]} <#${message.channel.id}> ID: ${message.id}`, { embed: message.embeds[0] });

    // Store updated reaction count within starboard DB
    await this.client.handlers.db.insert("starboard", {
      "id": `${message.channel.id}-${message.id}`,
      "data": {
        "sbEntryID": `${sbChanID}-${msg.id}`,
        "count": sbSet["limit"]
      }
    });

    return;
  }
};