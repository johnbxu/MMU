exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable("poll", function(table){
			table.increments("id");
			table.string("text");
			table.string("creator_email");
			table.date("date_created");
			table.date("end_date");
			table.string("randomURL");
		}).createTable("response", function(table){
			table.increments("id");
			table.integer("poll_id");
			table.string("text");
			table.string("borda");
		}).createTable("voter", function(table){
			table.increments("id");
			table.string("name");
			table.string("email");
		}).createTable("vote", function(table){
			table.increments("id");
			table.integer("response_id");
			table.integer("voter_id");
			table.integer("bordaValue");
		}).createTable("participant", function(table){
			table.increments("id");
			table.integer("poll_id");
			table.integer("voter_id");
			table.integer("voteStatus");
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable("response")
			.dropTable("poll")
			.dropTable("participant")
			.dropTable("vote")
			.dropTable("voter")

	]);
};
