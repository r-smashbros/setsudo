const path = require("path");
const klaw = require("klaw");
const fetch = require("snekfetch");
const { Client, Collection } = require("discord.js");

const commandsPath = path.join(__dirname, "commands");
const eventsPath = path.join(__dirname, "events");

new class extends Client {
  constructor() {
    super({
      fetchAllMembers: true,
      disableEveryone: true
    });

    // Load Config
    this.config = require("../config.json");

    // Init Global Vars
    this.commands = new Collection();
    this.events = new Collection();
    this.constants = require("./Constants.js");

    // Load Global Handlers
    this.handlers = {};
    this.handlers.antiInvite = new (require("./handlers/antiInvite.js"))(this);
    this.handlers.autoMod = new (require("./handlers/autoMod.js"))(this);
    this.handlers.db = new (require("./handlers/database.js"))(this);
    this.handlers.modNotes = new (require("./handlers/modNotes.js"))(this);
    this.handlers.starboard = new (require("./handlers/starboard.js"))(this);
    this.handlers.timers = new (require("./handlers/timers.js"))(this);

    // Run Init Functions
    this._init();

    // Login to Discord
    this.login(this.config["discord"]["token"]);
  }

  /**
   * Loads commands and events into discord.js Client instance
   * @private
   */
  _init() {
    this._loadCommands();
    this._loadEvents();
  }

  /**
   * Uploads input to hastebin and returns URL
   * @param {string} data Data to be uploaded to hastebin
   * @returns {string} Hastebin URL
   */
  async hastebin(data) {
    const { body } = await fetch.post(`${this.config.hastebinURL}/documents`).send(data).catch(() => { return false; });
    if (!body || !body.key) return false;
    return `${this.config.hastebinURL}/${body.key}`;
  }

  /**
   * Fetches all messages in a TextChannel and returns a Collection 
   * @param {TextChannel} channel TextChannel to have messages fetched from
   * @returns {Collection} Collection of all messages in the TextChannel
   */
  getChanMsg(channel) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      let lastMsgID = 0;
      let lastMsgCount = 100;
      let msgCollection = new Collection();

      while (lastMsgCount >= 100) {
        const tempColl = await channel.messages.fetch({ limit: 100, after: lastMsgID }).catch(reject);
        if (!tempColl.size) break;
        lastMsgCount = tempColl.size;
        lastMsgID = tempColl.last().id;
        msgCollection = msgCollection.concat(tempColl);
      }

      msgCollection = new Collection([...msgCollection].reverse());
      resolve(msgCollection);
    });
  }

  /**
   * Loads all commands in commandPath into discord.js Client
   * @private
   */
  _loadCommands() {
    klaw(commandsPath).on("data", item => {
      const file = path.parse(item.path);
      if (!file.ext || file.ext !== ".js") return;

      const command = new (require(`${file.dir}/${file.base}`))(this);
      this.commands.set(command.name, command);
    });
  }

  /**
   * Loads all events in eventsPath into discord.js Client
   * @private
   */
  _loadEvents() {
    klaw(eventsPath).on("data", item => {
      const file = path.parse(item.path);
      if (!file.ext || file.ext !== ".js") return;

      const event = new (require(`${file.dir}/${file.base}`))(this);
      this.events.set(event.name, event);
      console.log(`Loading event: ${event.name}`);
      this.on(event.name, (...args) => event.execute(...args));
    });
  }
};
