
exports.up = knex => knex.schema.createTable("list_portfolio", table => {
    table.increments('id');
    table.text('project_id');
    table.text('content');

    table.timestamp('created_at').default(knex.fn.now());
    table.timestamp('updated_at').default(knex.fn.now());
});


exports.down = knex => knex.schema.dropTable("list_portfolio");