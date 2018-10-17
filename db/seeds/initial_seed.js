let myDate = new Date();
let end = new Date();
end.setDate(myDate.getDate() + 1);

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('poll').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('poll').insert(  { text: 'A Sample Question',
                                creator_email: 'test@test.com',
                                date_created: myDate,
                                end_date: end,
                                randomURL: '12345'}).returning('id')
                    .then(function(id) {
                        return Promise.all( [ knex('response').insert({poll_id: id[0], text: 'Option 1'}),
                                              knex('response').insert({poll_id: id[0], text: 'Option 2'}),
                                              knex('response').insert({poll_id: id[0], text: 'Option 3'})])
        })
      ]);
    });
};
