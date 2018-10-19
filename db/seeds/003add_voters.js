let voter1 = {name: "Joe Blow", email: "fake@nope.com"};
let voter2 = {name: "Jane Person", email: "bad@fake.com"};

exports.seed = function(knex, Promise) {
	return Promise.all([
		// Inserts seed entries
		knex("voter").insert(voter1),
		knex("voter").insert(voter2)
	]);
};
