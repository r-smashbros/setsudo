const moment = require('moment');
const { MessageEmbed } = require('discord.js');
class Timers {
  constructor(client) {
    this.client = client;
    this.clock = null;
    this.init();
  }

  init() {
    this.clock = setInterval(async () => {
      const toExecute = this.client.db.tempModActions.filter(entry => Date.now() > entry.endTime);
      if (!toExecute.size) return;

      for (const key of toExecute.keyArray()) {
        const dbEntry = this.client.db.tempModActions.get(key);

        const user = await this.client.users.fetch(key.split('-')[1]).catch(() => null);
        if (!user) return;

        const guild = this.client.guilds.get(key.split('-')[0]);
        if (!guild) return;
        const member = await guild.members.fetch(user).catch(() => null);

        if (dbEntry['action'] === "silence" && member) {
          const gSettings = this.client.db.settings.get(guild.id);
          let muteRole = gSettings['mutedrole'];
          if (!muteRole || !guild.roles.get(muteRole)) return;
          muteRole = guild.roles.get(muteRole);
          member.roles.remove(muteRole);
        }

        if (dbEntry['action'] === "mute") {
          const gSettings = this.client.db.settings.get(guild.id);
          let muteRole = gSettings['mutedrole'];
          if (!muteRole || !guild.roles.get(muteRole)) return;
          muteRole = guild.roles.get(muteRole);
          if (member) member.roles.remove(muteRole);

          let muteChan = this.client.db.detention.get(`${guild.id}-${user.id}`);
          if (muteChan && guild.channels.get(muteChan)) {

            muteChan = guild.channels.get(muteChan);
            if (muteChan) {
              if (gSettings['logschannel'] && guild.channels.get(gSettings['logschannel'])) {

                const logsChan = guild.channels.get(gSettings['logschannel']);
                if (logsChan) {
                  let muteChanMsg = await this.client.getChanMsg(muteChan);
                  muteChanMsg = muteChanMsg
                    .map(m => `${moment(m.createdAt).format("dddd MMMM Do, YYYY, hh:mm A")} | ${m.author.tag} (${m.author.id}):\n${m.content}`)
                    .join("\n\n=-= =-= =-= =-= =-=\n\n");

                  const embed = new MessageEmbed()
                    .setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
                    .setDescription("Mute Automatically Ended")
                    .addField("Hastebin Link", await this.client.hastebin(muteChanMsg), false);

                  logsChan.send({ embed });
                }

              }

              await muteChan.delete();
            }
          }

          this.client.db.detention.delete(`${guild.id}-${user.id}`);
        }

        if (dbEntry['action'] === "tempban") {
          guild.members.unban(user);
        }

        this.client.db.tempModActions.delete(key);
      }
    }, 10 * 1000);
  }
}

module.exports = Timers;