exports.seed = function(knex, Promise) {
  return Promise.all([
    // Inserts seed entries
    knex('vote').insert({response_id: 1, voter_id: 1, bordaValue: 3}),
    knex('vote').insert({response_id: 2, voter_id: 1, bordaValue: 1}),
    knex('vote').insert({response_id: 3, voter_id: 1, bordaValue: 1}),
    knex('vote').insert({response_id: 4, voter_id: 1, bordaValue: 2}),
    knex('vote').insert({response_id: 5, voter_id: 1, bordaValue: 3}),
    knex('vote').insert({response_id: 6, voter_id: 1, bordaValue: 2}),
    knex('vote').insert({response_id: 1, voter_id: 2, bordaValue: 2}),
    knex('vote').insert({response_id: 2, voter_id: 2, bordaValue: 1}),
    knex('vote').insert({response_id: 3, voter_id: 2, bordaValue: 2}),
    knex('vote').insert({response_id: 4, voter_id: 2, bordaValue: 3}),
    knex('vote').insert({response_id: 5, voter_id: 2, bordaValue: 1}),
    knex('vote').insert({response_id: 6, voter_id: 2, bordaValue: 3}),
  ]);
};

