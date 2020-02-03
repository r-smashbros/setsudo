// K-GuildID-UserID; V-{actions: {mod, action, reason?, date}, notes:{mod, note, date}}
const { MessageEmbed } = require("discord.js");

class ModNotes {
  constructor(client) {
    this.client = client;
  }

  /**
   * Creates empty mod notes DB entry for a guild member
   * @private
   * 
   * @param {Message} message The original message from the command
   * @param {User} user The affected user
   * 
   * @returns {object} The affected user's mod notes DB entry
   */
  async _init(message, user) {
    await this.client.handlers.db.insert("modnotes", {
      "id": `${message.guild.id}-${user.id}`,
      "data": this.client.constants.defaultNotes
    });

    const notes = await this.client.handlers.db.get("modnotes", `${message.guild.id}-${user.id}`);
    return notes;
  }

  /**
   * Creates and returns a formatted date string
   * @private
   * @returns {string} Formatted date string
   */
  _getDateString() {
    const date = new Date().toDateString().split(" ");
    date.shift();
    return date.join(" ");
  }

  /**
   * Appends mod note to a users's DB entry
   * 
   * @param {Message} message The original message from the command
   * @param {User} user The affected user
   * @param {User} mod The moderator adding the note
   * @param {string} note The note to be added
   * 
   * @returns {Promise<>} An empty resolved promise
   */
  async addNote(message, user, mod, note) {

    // [SH] Handle stats if not self-hosted
    if (!this.client.config["selfhost"]) {
      if (!await this.client.handlers.db.has("activitystats", message.author.id))
        await this.client.handlers.db.insert("activitystats", {
          "id": message.author.id,
          "data": {
            "actions": 1,
            "messages": 0
          }
        });
      else {
        const stats = await this.client.handlers.db.get("activitystats", message.author.id);
        stats["data"]["actions"]++;
        await this.client.handlers.db.update("activitystats", message.author.id, stats);
      }
    }

    return new Promise(async (resolve, reject) => {
      const userNotes = await this.client.handlers.db.has("modnotes", `${message.guild.id}-${user.id}`) ?
        await this.client.handlers.db.get("modnotes", `${message.guild.id}-${user.id}`) :
        await this._init(message, user);

      // Append templated mod note to user notes
      userNotes["data"]["notes"].push({
        "mod": `${mod.tag} (${mod.id})`,
        "note": note,
        "date": this._getDateString()
      });

      await this.client.handlers.db.update("modnotes", `${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }

  /**
   * Updates existing reason for a mod note
   * 
   * @param {Message} message The original message from the command
   * @param {User} user The affected user
   * @param {string} nNum The number of the note to be edited
   * @param {string} note The updated reason
   * 
   * @returns {Promise<string>|Promise<>} An empty resolved promise or a rejected promise with an error
   */
  editNote(message, user, nNum, note) {

    // Arrays start at zero
    nNum = Number(nNum) - 1;

    return new Promise(async (resolve, reject) => {
      const userNotes = await this.client.handlers.db.has("modnotes", `${message.guild.id}-${user.id}`) ?
        await this.client.handlers.db.get("modnotes", `${message.guild.id}-${user.id}`) :
        await this._init(message, user);
      if (userNotes["data"] === this.client.constants.defaultNotes) return reject("User has no entries");

      if (!userNotes["data"]["notes"][nNum]) return reject(`Note #${nNum + 1} does not exist for ${user.id}`);

      // Update note reason
      userNotes["data"]["notes"][nNum].note = note;

      await this.client.handlers.db.update("modnotes", `${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }

  /**
   * Removes a mod note from a user's DB entry
   * 
   * @param {Message} message The original message from the command
   * @param {User} user The affected user
   * @param {string} nNum The number of the note to be removed
   * 
   * @returns {Promise<string>|Promise<>} An empty resolved promise or a rejected promise with an error
   */
  removeNote(message, user, nNum) {

    // Arrays start at zero
    nNum = Number(nNum) - 1;

    return new Promise(async (resolve, reject) => {
      const userNotes = await this.client.handlers.db.has("modnotes", `${message.guild.id}-${user.id}`) ?
        await this.client.handlers.db.get("modnotes", `${message.guild.id}-${user.id}`) :
        await this._init(message, user);
      if (userNotes["data"] === this.client.constants.defaultNotes) return reject("User has no entries");

      if (!userNotes["data"]["notes"][nNum]) return reject(`Note #${nNum + 1} does not exist for ${user.id}`);

      // Remove note entry
      userNotes["data"]["notes"].splice(nNum, 1);

      await this.client.handlers.db.update("modnotes", `${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }

  /**
   * Fetches all mod notes and returns a formatted list or MessageEmbed
   * 
   * @param {Message} message The original message from the command
   * @param {User} user The affected user
   * 
   * @returns {Promise<string>|Promise<MessageEmbed>} A promise with a formatted list of mod notes or a promise with a MessageEmbed instance
   */
  listNotes(message, user) {
    return new Promise(async (resolve, reject) => {
      const userNotes = await this.client.handlers.db.has("modnotes", `${message.guild.id}-${user.id}`) ?
        await this.client.handlers.db.get("modnotes", `${message.guild.id}-${user.id}`) :
        await this._init(message, user);

      let desc = "";

      // Append all mod actions
      desc += "**__Mod Actions__**\n";
      if (userNotes["data"]["actions"].length) {
        // Loop over all actions and append formatted information to string
        userNotes["data"]["actions"].forEach((item, index) => {
          desc += `${index + 1}. ${item.mod}・${item.date}\n`;
          desc += `\`\`\`[${item.action}] ${item.reason}\`\`\`\n`;
        });
      } else desc += "No actions stored\n\n";

      // Append all mod notes
      desc += "**__Mod Notes__**\n";
      if (userNotes["data"]["notes"].length) {
        // Loop over all notes and append formatted information to string
        userNotes["data"]["notes"].forEach((item, index) => {
          desc += `${index + 1}. ${item.mod}・${item.date}\n`;
          desc += `\`\`\`${item.note}\`\`\`${userNotes["data"]["notes"].length === (index + 1) ? "" : "\n"}`;
        });
      } else desc += "No notes stored";

      return resolve(
        // Check if length is longer than Discord's maximum length for MessageEmbed descriptions
        desc.length > 2048 ?
          desc :
          new MessageEmbed()
            .setAuthor(`Mod Notes for ${user.tag} (${user.id})`, user.displayAvatarURL(), "https://google.com/")
            .setDescription(desc)
            .setColor(this.client.constants.colours.info)
      );
    });
  }

  /**
   * Appends an action to a user's DB entry
   * 
   * @param {Message} message The original message from the command
   * @param {User} user The affected user
   * @param {User} mod The moderator issuing the action
   * @param {string} action The action being issued
   * @param {string} reason The reason for the action
   * 
   * @returns {Promise<>} An empty resolved promise
   */
  async addAction(message, user, mod, action, reason) {

    // [SH] Handle stats if not self-hosted
    if (!this.client.config["selfhost"]) {
      if (!await this.client.handlers.db.has("activitystats", message.author.id))
        await this.client.handlers.db.insert("activitystats", {
          "id": message.author.id,
          "data": {
            "actions": 1,
            "messages": 0
          }
        });
      else {
        const stats = await this.client.handlers.db.get("activitystats", message.author.id);
        stats["data"]["actions"]++;
        await this.client.handlers.db.update("activitystats", message.author.id, stats);
      }
    }

    return new Promise(async (resolve, reject) => {
      const userNotes = await this.client.handlers.db.has("modnotes", `${message.guild.id}-${user.id}`) ?
        await this.client.handlers.db.get("modnotes", `${message.guild.id}-${user.id}`) :
        await this._init(message, user);

      // Append templated mod action to user notes
      userNotes["data"]["actions"].push({
        "mod": `${mod.tag} (${mod.id})`,
        "action": action,
        "reason": reason,
        "date": this._getDateString()
      });

      await this.client.handlers.db.update("modnotes", `${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }

  /**
   * Updates existing reason for a mod action
   * 
   * @param {Message} message The original message from the command
   * @param {User} user The affected user
   * @param {string} aNum The number of the action to be edited
   * @param {string} reason The updated reason
   * 
   * @returns {Promise<string>|Promise<>} An empty resolved promise or a rejected promise with an error
   */
  editAction(message, user, aNum, reason) {

    // Arrays start at zero
    aNum = Number(aNum) - 1;

    return new Promise(async (resolve, reject) => {
      const userNotes = await this.client.handlers.db.has("modnotes", `${message.guild.id}-${user.id}`) ?
        await this.client.handlers.db.get("modnotes", `${message.guild.id}-${user.id}`) :
        await this._init(message, user);
      if (userNotes["data"] === this.client.constants.defaultNotes) return reject("User has no entries");

      if (!userNotes["data"]["actions"][aNum]) return reject(`Action #${aNum + 1} does not exist for ${user.id}`);

      // Update action reason
      userNotes["data"]["actions"][aNum].reason = reason;

      await this.client.handlers.db.update("modnotes", `${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }

  /**
   * Removes an action from a user's DB entry
   * 
   * @param {Message} message The original message from the command
   * @param {User} user The affected user
   * @param {string} aNum The number of the action to be removed
   * 
   * @returns {Promise<string>|Promise<>} An empty resolved promise or a rejected promise with an error
   */
  removeAction(message, user, aNum) {

    // Arrays start at zero
    aNum = Number(aNum) - 1;

    return new Promise(async (resolve, reject) => {
      const userNotes = await this.client.handlers.db.has("modnotes", `${message.guild.id}-${user.id}`) ?
        await this.client.handlers.db.get("modnotes", `${message.guild.id}-${user.id}`) :
        await this._init(message, user);
      if (userNotes["data"] === this.client.constants.defaultNotes) return reject("User has no entries");

      if (!userNotes["data"]["actions"][aNum]) return reject(`Action #${aNum + 1} does not exist for ${user.id}`);

      // Remove action entry
      userNotes["data"]["actions"].splice(aNum, 1);

      await this.client.handlers.db.update("modnotes", `${message.guild.id}-${user.id}`, userNotes);
      return resolve();
    });
  }
}

module.exports = ModNotes;
