exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table("vote", function(table) {
			table.dropForeign("voter_id");
			table.dropColumn("voter_id");
		}).then(function() {
			return knex.schema.dropTable("voter");
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable("voter", function(table){
			table.increments("id");
			table.string("name");
			table.string("email");
		}),
		knex.schema.table("vote", function(table) {
			table.integer("voter_id");
			table.foreign("voter_id").references("voter.id");
		}),
	]);
};
