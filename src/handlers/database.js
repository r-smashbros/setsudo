const r = require("rethinkdbdash");
const credentials = require(`../../config.json`).database.creds;

class DatabaseHandler {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });

    this.connection = r(credentials);
  }

  async get(table, key) {
    return key ?
      this.connection.table(table).get(key) :
      this.connection.table(table);
  }

  async has(table, key) {
    return !!(await this.connection.table(table).get(key));
  }

  async insert(table, data) {
    return this.connection.table(table).insert(data);
  }

  async update(table, key, data) {
    return this.connection.table(table).get(key).update(data);
  }

  async delete(table, key) {
    return this.connection.table(table).delete(key);
  }

  async deleteAll(table) {
    return this.connection.table(table).delete();
  }

  async filterGet(table, obj) {
    return this.connection.table(table).filter(obj);
  }
}

module.exports = DatabaseHandler;
