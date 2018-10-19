exports.seed = function(knex, Promise) {
	return Promise.all([
		knex("voter").del(),
		knex("vote").del(),
		knex("response").del(),
		knex("poll").del(),
		knex.schema.raw("ALTER SEQUENCE vote_id_seq RESTART;"),
		knex.schema.raw("ALTER SEQUENCE voter_id_seq RESTART;"),
		knex.schema.raw("ALTER SEQUENCE response_id_seq RESTART;"),
		knex.schema.raw("ALTER SEQUENCE poll_id_seq RESTART;"),
	]);
};