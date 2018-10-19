exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table("response", function(table){
			table.dropColumn("borda");
		}).table("response", function(table){
			table.integer("borda");
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table("response", function(table){
			table.dropColumn("borda");
		}).table("response", function(table){
			table.string("borda");
		})
	]);
};
