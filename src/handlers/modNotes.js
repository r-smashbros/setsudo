// K-GuildID-UserID; V-{actions: {mod, action, reason?, date}, notes:{mod, note, date}}
const { MessageEmbed } = require('discord.js');

class ModNotes {
  constructor(client) {
    this.client = client;
  }

  _init(message, user) {
    this.client.db.modNotes.set(`${message.guild.id}-${user.id}`, this.client.constants.defaultNotes);
    return this.client.db.modNotes.get(`${message.guild.id}-${user.id}`);
  }

  _getDateString() {
    const date = new Date().toDateString().split(' ');
    date.shift();
    return date.join(' ');
  }

  addNote(message, user, mod, note) {

    // [SH] Handle stats if not self-hosted
    if (!this.client.config['selfhost']) this.client.db.activityStats.inc(message.author.id, "actions");

    return new Promise((resolve, reject) => {
      const userNotes = this.client.db.modNotes.get(`${message.guild.id}-${user.id}`) || this._init(message, user);

      userNotes['notes'].push({
        "mod": `${mod.tag} (${mod.id})`,
        "note": note,
        "date": this._getDateString()
      });

      this.client.db.modNotes.set(`${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }

  editNote(message, user, nNum, note) {
    nNum = Number(nNum) - 1;
    return new Promise((resolve, reject) => {
      const userNotes = this.client.db.modNotes.get(`${message.guild.id}-${user.id}`) || this._init(message, user);
      if (userNotes === this.client.constants.defaultNotes) return reject("User has no entries");

      if (!userNotes['notes'][nNum]) return reject(`Note #${nNum + 1} does not exist for ${user.id}`);

      userNotes['notes'][nNum].note = note;

      this.client.db.modNotes.set(`${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }

  removeNote(message, user, nNum) {
    nNum = Number(nNum) - 1;
    return new Promise((resolve, reject) => {
      const userNotes = this.client.db.modNotes.get(`${message.guild.id}-${user.id}`) || this._init(message, user);
      if (userNotes === this.client.constants.defaultNotes) return reject("User has no entries");

      if (!userNotes['notes'][nNum]) return reject(`Note #${nNum + 1} does not exist for ${user.id}`);

      userNotes['notes'].splice(nNum, 1);
      this.client.db.modNotes.set(`${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }

  listNotes(message, user) {
    return new Promise((resolve, reject) => {
      const userNotes = this.client.db.modNotes.get(`${message.guild.id}-${user.id}`) || this._init(message, user);

      let desc = "";
      desc += "**__Mod Actions__**\n";
      if (userNotes['actions'].length) {
        userNotes['actions'].forEach((item, index) => {
          desc += `${index + 1}. ${item.mod}・${item.date}\n`;
          desc += `\`\`\`[${item.action}] ${item.reason}\`\`\`\n`;
        });
      } else desc += "No actions stored\n\n";

      desc += "**__Mod Notes__**\n";
      if (userNotes['notes'].length) {
        userNotes['notes'].forEach((item, index) => {
          desc += `${index + 1}. ${item.mod}・${item.date}\n`;
          desc += `\`\`\`${item.note}\`\`\`${userNotes['notes'].length === (index + 1) ? "" : "\n"}`;
        });
      } else desc += "No notes stored";

      return resolve(
        desc.length > 2048 ?
          desc :
          new MessageEmbed()
            .setAuthor(`Mod Notes for ${user.tag} (${user.id})`, user.displayAvatarURL(), "https://google.com/")
            .setDescription(desc)
            .setColor(this.client.constants.colours.info)
      );
    });
  }

  addAction(message, user, mod, action, reason) {

    // [SH] Handle stats if not self-hosted
    if (!this.client.config['selfhost']) this.client.db.activityStats.inc(message.author.id, "actions");

    return new Promise((resolve, reject) => {
      const userNotes = this.client.db.modNotes.get(`${message.guild.id}-${user.id}`) || this._init(message, user);

      userNotes['actions'].push({
        "mod": `${mod.tag} (${mod.id})`,
        "action": action,
        "reason": reason,
        "date": this._getDateString()
      });

      this.client.db.modNotes.set(`${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }

  editAction(message, user, aNum, reason) {
    aNum = Number(aNum) - 1;
    return new Promise((resolve, reject) => {
      const userNotes = this.client.db.modNotes.get(`${message.guild.id}-${user.id}`) || this._init(message, user);
      if (userNotes === this.client.constants.defaultNotes) return reject("User has no entries");

      if (!userNotes['actions'][aNum]) return reject(`Action #${aNum + 1} does not exist for ${user.id}`);

      userNotes['actions'][aNum].reason = reason;

      this.client.db.modNotes.set(`${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }

  removeAction(message, user, aNum) {
    aNum = Number(aNum) - 1;
    return new Promise((resolve, reject) => {
      const userNotes = this.client.db.modNotes.get(`${message.guild.id}-${user.id}`) || this._init(message, user);
      if (userNotes === this.client.constants.defaultNotes) return reject("User has no entries");

      if (!userNotes['actions'][aNum]) return reject(`Action #${aNum + 1} does not exist for ${user.id}`);

      userNotes['actions'].splice(aNum, 1);
      this.client.db.modNotes.set(`${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }
}

module.exports = ModNotes;