const sqliteConnection = require('../../sqlite');
const createUsers = require('./createUsers');


async function migrationsRun() {
  const schemas = [
    createUsers
  ].join('');

  sqliteConnection()
  .then((db) =>
  db.exec(schemas, [], (error) => {
    if (error) throw error;
  })
)
  .catch(error => console.error(error));
  
}

module.exports = migrationsRun;