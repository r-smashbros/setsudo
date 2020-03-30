const Event = require('../structures/event.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "voiceStateUpdate"
    });
  }

  /**
   * Entry point for voiceStateUpdate event
   * 
   * @param {VoiceState} oldState Old instance of a member's VoiceState
   * @param {VoiceState} newState New instance of a member's VoiceState
   */
  async execute(oldState, newState) {
    const gSettings = await this.client.handlers.db.get("settings", oldState.guild.id);

    this._handleVCLogging(oldState, newState, gSettings);
    this._handleDynamicVC(oldState, newState, gSettings);
  }

  /**
   * Process all required logging for VoiceState event
   * @private
   * 
   * @param {VoiceState} oldState Old instance of a member's VoiceState
   * @param {VoiceState} newState New instance of a member's VoiceState
   * @param {object} gSettings The guild's settings
   */
  _handleVCLogging(oldState, newState, gSettings) {
    const oldID = oldState.channelID;
    const newID = newState.channelID;

    if (!gSettings["vclogschannel"] || !oldState.guild.channels.get(gSettings["vclogschannel"])) return;
    const vcLogsChan = oldState.guild.channels.get(gSettings["vclogschannel"]);

    // VC Join
    if (!oldID && newID) {
      vcLogsChan.send({
        embed: new MessageEmbed()
          .setAuthor(`${newState.member.user.tag} (${newState.member.user.id})`, newState.member.user.avatarURL())
          .setColor(this.client.constants.colours.join)
          .setDescription(`${newState.channel.name} (${newState.channelID})`)
          .setFooter("VC Joined")
          .setTimestamp()
      });
    }

    // VC Change
    if (oldID && newID) {
      vcLogsChan.send({
        embed: new MessageEmbed()
          .setAuthor(`${oldState.member.user.tag} (${oldState.member.user.id})`, oldState.member.user.avatarURL())
          .setColor(this.client.constants.colours.change)
          .addField("Old VC", `${oldState.channel.name} (${oldState.channelID})`)
          .addField("New VC", `${newState.channel.name} (${newState.channelID})`)
          .setFooter("VC Changed")
          .setTimestamp()
      });
    }

    // VC Leave
    if (oldID && !newID) {
      vcLogsChan.send({
        embed: new MessageEmbed()
          .setAuthor(`${oldState.member.user.tag} (${oldState.member.user.id})`, oldState.member.user.avatarURL())
          .setColor(this.client.constants.colours.leave)
          .setDescription(`${oldState.channel.name} (${oldState.channelID})`)
          .setFooter("VC Left")
          .setTimestamp()
      });
    }
  }

  /**
   * Process anything to do with Dynamic VCs
   * @private
   * 
   * @param {VoiceState} oldState Old instance of a member's VoiceState
   * @param {VoiceState} newState New instance of a member's VoiceState
   * @param {object} gSettings The guild's settings
   */
  async _handleDynamicVC(oldState, newState, gSettings) {
    if (
      !gSettings["dynamicvccategory"] ||
      !oldState.guild.channels.get(gSettings["dynamicvccategory"]) ||
      !gSettings["dynamicvcbasevc"] ||
      !oldState.guild.channels.get(gSettings["dynamicvcbasevc"])
    ) return;

    const createVC = oldState.guild.channels.get(gSettings["dynamicvcbasevc"]);

    const vcDBEntry = await this.client.handlers.db.get("dynamicvc", `${oldState.guild.id}-${oldState.member.id}`);

    // Handle new VC creation
    if (!vcDBEntry && newState.channelID === gSettings["dynamicvcbasevc"]) {
      // Prevent user from making multiple dynamic VC sessions
      await createVC.updateOverwrite(newState.member.user, { CONNECT: false });

      const mainChannel = await newState.guild.channels.create(`${newState.member.user.username}'s Channel`, {
        type: "voice",
        parent: gSettings["dynamicvccategory"],
        permissionOverwrites: [
          {
            id: newState.guild.id,
            // Prevent users from joining directly
            deny: ["CONNECT"]
          },
          {
            id: newState.member.user.id,
            allow: ["CONNECT", "MOVE_MEMBERS"]
          }
        ]
      });

      const secondaryChannel = await newState.guild.channels.create(`^ Join to be moved`, {
        type: "voice",
        parent: gSettings["dynamicvccategory"],
        permissionOverwrites: [
          {
            id: newState.member.user.id,
            allow: ["MOVE_MEMBERS"],
            deny: ["CONNECT"]
          },
          {
            id: newState.guild.id,
            // Prevent people from chatting while waiting
            deny: ["SPEAK"]
          }
        ]
      });

      await this.client.handlers.db.insert("dynamicvc", {
        "id": `${newState.guild.id}-${newState.member.id}`,
        "data": { main: mainChannel.id, secondary: secondaryChannel.id }
      });

      // Move the user to the new dynamic VC
      newState.setChannel(mainChannel).catch(e => console.error("Cannot move member - voiceStateUpdate event"));
    }

    // Handle VC deletion
    if (vcDBEntry && (!newState.channelID || newState.channelID !== vcDBEntry["data"]["main"])) {
      const mainChannel = newState.guild.channels.get(vcDBEntry["data"]["main"]);
      const secondaryChannel = newState.guild.channels.get(vcDBEntry["data"]["secondary"]);

      if (mainChannel) mainChannel.delete().catch(e => console.error("Cannot delete VC - voiceStateUpdate event"));
      if (secondaryChannel) secondaryChannel.delete().catch(e => null);

      await this.client.handlers.db.delete("dynamicvc", `${oldState.guild.id}-${oldState.member.id}`);

      // Allow user to create more dynamic VCs
      createVC.permissionOverwrites.get(oldState.member.id).delete();
    }
  }
};