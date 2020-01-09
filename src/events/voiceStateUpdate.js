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
  execute(oldState, newState) {
    const oldID = oldState.channelID;
    const newID = newState.channelID;

    const guild = oldState.guild;
    const gSettings = this.client.db.settings.get(guild.id);
    if (!gSettings["vclogschannel"] || !guild.channels.get(gSettings["vclogschannel"])) return;
    const vcLogsChan = guild.channels.get(gSettings["vclogschannel"]);

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
};