$(() => {
	$("#submitOrder").click(function (event) {
		event.preventDefault();
		const order = [];
		const voter = $("#name").val();

		const id = $("#submitOrder").attr("url");
		Array.from($("#sortable")
			.children(".sortableContainer"))
			.forEach((child) => {
				order.push(Number(child.id));
			});
		
		console.log(order);
		$.ajax({
			url: `/polls/${id}`,
			method: "PUT",
			data: {
				obj: order,
				voterName: voter },
			dataType: "json",
			success: function(response) {
				console.log(response);
				window.location.href = `/polls/${id}/thanks`;
			}
		});
	});
});