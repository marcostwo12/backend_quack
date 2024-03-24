
exports.up = knex => knex.schema.createTable("images", table => {
    table.increments('id');
    table.text('project_id');
    table.text('url');
    table.text('alt');
});


exports.down = knex => knex.schema.dropTable("images");