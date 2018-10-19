exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table("response", function(table){
			table.foreign("poll_id").references("id").inTable("poll");
		}).table("vote", function(table){
			table.foreign("response_id").references("id").inTable("response");
			table.foreign("voter_id").references("id").inTable("voter");
		}).table("participant", function(table){
			table.foreign("poll_id").references("id").inTable("poll");
			table.foreign("voter_id").references("id").inTable("voter");
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table("response", function(table){
			table.dropForeign("poll_id");
		}).table("vote", function(table){
			table.dropForeign("response_id");
			table.dropForeign("voter_id");
		}).table("participant", function(table){
			table.dropForeign("poll_id");
			table.dropForeign("voter_id");
		})
	]);
};
