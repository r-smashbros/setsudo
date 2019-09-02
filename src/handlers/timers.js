class Timers {
  constructor(client) { 
    this.client = client;
    this.init();
    this.clock = null;
  }

  init() { 
    this.clock = setInterval(async () => {
      const toExecute = this.client.db.tempModActions.filter(entry => Date.now() > entry.endTime);
      if (!toExecute.size) return;

      for (const key of toExecute.keyArray()) {
        const dbEntry = this.client.db.tempModActions.get(key);

        const user = this.client.users.get(key.split('-')[1]);
        if (!user) return;

        const guild = this.client.guilds.get(key.split('-')[0]);
        if (!guild) return;
        const member = await guild.members.fetch(user);

        if (dbEntry['action'] === "mute") { 
          const gSettings = this.client.db.settings.get(guild.id);
          let muteRole = gSettings['mutedrole'];
          if (!muteRole || !guild.roles.get(muteRole)) return;
          muteRole = guild.roles.get(muteRole);

          member.roles.remove(muteRole);
        }

        this.client.db.tempModActions.delete(key);
      }
    }, 10 * 1000);
  }
}

module.exports = Timers;