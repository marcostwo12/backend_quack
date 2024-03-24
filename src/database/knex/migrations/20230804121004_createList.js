
exports.up = knex => knex.schema.createTable("list", table => {
    table.increments('id');
    table.text('project_id');
    table.text('content');
});


exports.down = knex => knex.schema.dropTable("list");