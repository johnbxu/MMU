exports.up = function(knex, Promise) {
  return knex.schema.table('response', function(table) {
     table.string("description");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('response', function(table) {
    table.dropColumn('description');
  })
};
