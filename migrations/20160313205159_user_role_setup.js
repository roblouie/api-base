
exports.up = function(knex) {
    return knex.schema.createTable('user', table => {
        table.increments('id').primary();
        table.string('username').notNullable();
        table.string('password').notNullable();
        table.string('facebook_token');
        table.string('first_name');
        table.string('last_name');
        table.string('facebook_id');
    }).createTable('role', table => {
        table.increments('id').primary();
        table.string('name');
    }).createTable('user_role', table => {
        table.integer('user_id').unsigned().references('user.id');
        table.integer('role_id').unsigned().references('role.id');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('user')
        .dropTable('role')
        .dropTable('user_role');
};
