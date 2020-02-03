const r = require("rethinkdbdash");
const credentials = require(`../../config.json`).database.creds;

class DatabaseHandler {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });

    this.connection = r(credentials);
  }

  /**
   * Retrieves database entry data
   * 
   * @param {string} table Name of table
   * @param {string?} key Key of database entry
   * 
   * @returns {object|object[]} Database response
   */
  async get(table, key) {
    return key ?
      this.connection.table(table).get(key) :
      this.connection.table(table);
  }

  /**
  * Checks if database has an entry with a matching key
  * 
  * @param {string} table Name of table
  * @param {string?} key Key of database entry
  * 
  * @returns {boolean} Whether or not the entry exists
  */
  async has(table, key) {
    return !!(await this.connection.table(table).get(key));
  }

  /**
   * Inserts data into database
   * 
   * @param {string} table Name of table
   * @param {*} data Data to be inserted
   * 
   * @returns {object} Status of insertion
   */
  async insert(table, data) {
    return this.connection.table(table).insert(data);
  }

  /**
   * Updates database entry
   * 
   * @param {string} table Name of table
   * @param {string} key Key of database entry
   * @param {*} data Data to update entry with
   * 
   * @returns {object} Status of update
   */
  async update(table, key, data) {
    return this.connection.table(table).get(key).update(data);
  }

  /**
   * Deletes database entry
   * 
   * @param {string} table Name of table
   * @param {string} key Key of database entry
   * 
   * @returns {object} Status of deletion
   */
  async delete(table, key) {
    return this.connection.table(table).delete(key);
  }

  /**
   * Deletes all entries in table
   * @param {string} table Name of table
   * @returns {object} Status of deletion
   */
  async deleteAll(table) {
    return this.connection.table(table).delete();
  }

  /**
   * Filters database entries and returns matching entries
   * 
   * @param {string} table Name of table
   * @param {Function} obj Function to filter entries with
   * 
   * @returns {object[]} Matching database entries
   */
  async filterGet(table, obj) {
    return this.connection.table(table).filter(obj);
  }
}

module.exports = DatabaseHandler;
