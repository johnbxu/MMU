let today = new Date();
let tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

exports.seed = function(knex, Promise) {
	return Promise.all([
		knex("poll").insert(  { text: "Another Question",
			creator_email: "knex@sucks.balls",
			date_created: today,
			end_date: tomorrow,
			randomURL: "23456"}).returning("id")
			.then(function(id) {
				return Promise.all( [ knex("response").insert({poll_id: id[0], text: "(2)Option 1", borda: 0}),
					knex("response").insert({poll_id: id[0], text: "(2)Option 2", borda: 0}),
					knex("response").insert({poll_id: id[0], text: "(2)Option 3", borda: 0})]);
			}),
		// Inserts seed entries
		knex("poll").insert(  { text: "A Sample Question",
			creator_email: "test@test.com",
			date_created: today,
			end_date: tomorrow,
			randomURL: "12345"}).returning("id")
			.then(function(id) {
				return Promise.all( [ knex("response").insert({poll_id: id[0], text: "Option 1", borda: 0}),
					knex("response").insert({poll_id: id[0], text: "Option 2", borda: 0}),
					knex("response").insert({poll_id: id[0], text: "Option 3", borda: 0})]);
			})
	]);
};
