const Event = require('../structures/event.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "raw"
    });
  }

  execute(ctx = null) {
    if (ctx.t === "MESSAGE_REACTION_ADD") return this._handleReaction(ctx, true);
    else if (ctx.t === "MESSAGE_REACTION_REMOVE") return this._handleReaction(ctx, false);
    else return;
  }

  async _handleReaction(data, action) {
    const reaction = data.d;
    const user = await this.client.users.fetch(reaction.user_id).catch(() => null);
    if (user === null) return;
    const channel = this.client.channels.get(reaction.channel_id);
    if (!channel || channel.type !== "text" || channel.permissionsFor(this.client.user).has("VIEW_CHANNEL") === false) return;
    const message = await channel.messages.fetch(reaction.message_id);
    const member = await message.guild.members.fetch(user.id);

    const gSettings = this.client.db.settings.get(message.guild.id);
    if (!Object.keys(gSettings['starboard']).length) return;

    for (const [id, val] of Object.entries(gSettings['starboard'])) {
      if (
        (val['emoji']['unicode'] && reaction.emoji.name === val['emoji']['name']) ||
        (!val['emoji']['unicode'] && reaction.emoji.id === val['emoji']['id'])
      ) {
        if (this.client.db.starboard.has(`${channel.id}-${message.id}`))
          return this._handleUpdate(message, id, val, this.client.db.starboard.get(`${channel.id}-${message.id}`), action);
        else
          return this._handleNew(message, id, val);
      }
    }
  }

  async _handleNew(message, sbChanID, sbSet) {
    const emojiData = sbSet['emoji'];

    const reactions = message.reactions.filter(r => r._emoji.name === emojiData['name']);
    if (reactions.size < 1 || sbSet['limit'] > reactions.first().count) return;

    const embed = new MessageEmbed()
      .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL())
      .setFooter(message.channel.name)
      .setTimestamp()
      .setColor(0xffff00);
    
    if (message.content) embed.setDescription(message.content);
    if (message.attachments.size) embed.setImage(message.attachments.first().url);

    const sbChan = this.client.channels.get(sbChanID);

    const msg = await sbChan.send(
      `${emojiData['unicode'] ? emojiData['name'] : `:${emojiData['name']}:`} ${sbSet['limit']} <#${message.channel.id}> ID: ${message.id}`, { embed }
    );

    this.client.db.starboard.set(`${message.channel.id}-${message.id}`,
      {
        "sbEntryID": `${sbChanID}-${msg.id}`,
        "count": sbSet['limit']
      }
    );

  }

  async _handleUpdate(message, sbChanID, sbSet, sbData, action) {
    const emojiData = sbSet['emoji'];
    
    const msg = await this.client.channels.get(sbData['sbEntryID'].split('-')[0]).messages.fetch(sbData['sbEntryID'].split('-')[1]);

    const reactions = message.reactions.filter(r => r._emoji.name === emojiData['name']);
    if (reactions.size < 1 || sbSet['limit'] > reactions.first().count) {
      this.client.db.starboard.delete(`${message.channel.id}-${message.id}`);
      return msg.delete();
    }

    action ? sbData['count']++ : sbData['count']--;

    if (!msg) {
      const embed = new MessageEmbed()
        .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL())
        .setFooter(message.channel.name)
        .setTimestamp()
        .setColor(0xffff00);

      if (message.content) embed.setDescription(message.content);
      if (message.attachments.size) embed.setImage(message.attachments.first().url);

      const sbChan = this.client.channels.get(sbChanID);

      const msg = await sbChan.send(
        `${emojiData['unicode'] ? emojiData['name'] : `:${emojiData['name']}:`} ${sbData['count']} <#${message.channel.id}> ID: ${message.id}`, { embed }
      );

      this.client.db.starboard.set(`${message.channel.id}-${message.id}`,
        {
          "sbEntryID": `${sbChanID}-${msg.id}`,
          "count": sbData['count']
        }
      );

      return;
    }

    msg.edit(`${emojiData['unicode'] ? emojiData['name'] : `:${emojiData['name']}:`} ${sbData['count']} <#${message.channel.id}> ID: ${message.id}`, { embed: message.embeds[0] });

    this.client.db.starboard.set(`${message.channel.id}-${message.id}`,
      {
        "sbEntryID": sbData['sbEntryID'],
        "count": sbData['count']
      }
    );

    return;
  }
};