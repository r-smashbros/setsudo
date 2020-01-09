const moment = require("moment");
const { MessageEmbed, TextChannel } = require("discord.js");

class Timers {
  constructor(client) {
    this.client = client;
    this.clock = null;
    this._init();
  }

  /**
   * Initalize timers for timed events
   * @private
   */
  _init() {
    this.clock = setInterval(async () => {
      // Filter only expired events
      const toExecute = this.client.db.tempModActions.filter(entry => Date.now() > entry.endTime);
      if (!toExecute.size) return;

      // Loop over every event
      for (const key of toExecute.keyArray()) {
        // Get event DB entry
        const dbEntry = this.client.db.tempModActions.get(key);

        // Fetch affected user
        const user = await this.client.users.fetch(key.split("-")[1]).catch(() => null);
        if (!user) return;

        // Fetch guild where action took place
        const guild = this.client.guilds.get(key.split("-")[0]);
        if (!guild) return;

        // Fetch GuildMember instance for affected user
        const member = await guild.members.fetch(user).catch(() => null);

        // Check if action is a silence and the user is still a member of the guild
        if (dbEntry["action"] === "silence" && member) {
          // Get guild's muted role
          const gSettings = this.client.db.settings.get(guild.id);
          let muteRole = gSettings["mutedrole"];
          if (!muteRole || !guild.roles.get(muteRole)) return;
          muteRole = guild.roles.get(muteRole);

          // Remove muted role
          member.roles.remove(muteRole);
        }

        // Check if action is mute. Member check not required for logging purposes
        if (dbEntry["action"] === "mute") {

          // Get guild's muted role
          const gSettings = this.client.db.settings.get(guild.id);
          let muteRole = gSettings["mutedrole"];
          if (!muteRole || !guild.roles.get(muteRole)) return;
          muteRole = guild.roles.get(muteRole);

          // Remove muted role if member exists
          if (member) member.roles.remove(muteRole);

          // Get affected user's mute channel
          let muteChan = this.client.db.detention.get(`${guild.id}-${user.id}`);
          if (muteChan && (muteChan = guild.channels.get(muteChan))) {

            // Check if guild has a logs channel
            if (gSettings["modlogschannel"] && guild.channels.get(gSettings["modlogschannel"])) {

              const logsChan = guild.channels.get(gSettings["modlogschannel"]);

              // Fetch all messages in channel
              let muteChanMsg = await this.client.getChanMsg(muteChan);
              
              // Convert messages from Collection to formatted string
              muteChanMsg = muteChanMsg
                .map(m => `${moment(m.createdAt).format("dddd MMMM Do, YYYY, hh:mm A")} | ${m.author.tag} (${m.author.id}):\n${m.content}`)
                .join("\n\n=-= =-= =-= =-= =-=\n\n");

              // Build embed for logs channel
              const embed = new MessageEmbed()
                .setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
                .setDescription("Mute Automatically Ended")
                .addField("Hastebin Link", await this.client.hastebin(muteChanMsg), false);

              // Send embed in logs channel
              logsChan.send({ embed });
            }

            // Delete the affected user's mute channel
            await muteChan.delete();
          }

          // Delete the affected user's DB entry
          this.client.db.detention.delete(`${guild.id}-${user.id}`);
        }

        // Check if action is a tempban
        if (dbEntry["action"] === "tempban") {
          guild.members.unban(user);
        }

        // Delete event DB entry
        this.client.db.tempModActions.delete(key);
      }
    }, 10 * 1000);
  }
}

module.exports = Timers;