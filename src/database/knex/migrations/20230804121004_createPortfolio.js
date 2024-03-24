
exports.up = knex => knex.schema.createTable("portfolio", table => {
    table.increments('id');
    table.text('title');
    table.text('description');
    table.text('category');

    table.timestamp('created_at').default(knex.fn.now());
    table.timestamp('updated_at').default(knex.fn.now());
});


exports.down = knex => knex.schema.dropTable("portfolio");