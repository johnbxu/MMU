exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table("response", function(table) {
			table.renameColumn("text", "response_text");
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table("response", function(table) {
			table.renameColumn("response_text", "text");
		})
	]);
};
