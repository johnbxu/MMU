$(() => {
	$("#submitOrder").click(function (event) {
    event.preventDefault();
    
		const order = [];

		if ($("#name").val() == "") {
      alert("You must provide a name");
			return;
		}

		const id = $("#submitOrder").attr("url");
		Array.from($("#sortable")
			.children(".sortableContainer"))
			.forEach((child) => {
				order.push(Number(child.id));
			});
      
		$.ajax({
			url: `/polls/${id}`,
			method: "PUT",
			data: {
				obj: order,
				voterName: $("#name").val()
			},
			dataType: "json",
			success: window.location.href = `/polls/${id}/thanks`
		});
	});
});
