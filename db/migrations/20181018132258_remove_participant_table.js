exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('participant'),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('participant', function(table){
      table.increments('id');
      table.integer('poll_id');
      table.integer('voter_id');
      table.integer('voteStatus');
    })
  ]);
}
