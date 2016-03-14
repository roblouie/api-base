'use strict';

const dbConfig = require('../knexfile');
const knex = require('knex')(dbConfig['development']);

knex.migrate.latest();

module.exports = require('bookshelf')(knex);

