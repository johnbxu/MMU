exports.up = function(knex, Promise) {
	return knex.schema.table("poll", function(table) {
		table.string("creator_name");
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.table("poll", function(table) {
		table.dropColumn("creator_name");
	});
};
