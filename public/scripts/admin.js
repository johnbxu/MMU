$(() => {
	const randomURL = $("#deleteButton").attr("randomURL");
	
	$("#deleteButton").click(function(){
		$.ajax({
			url: `/polls/${randomURL}?_method=DELETE`,
			method: "post"
		}).done(function(response) {
			window.location.href = "http://localhost:8080";
		});
	});
});
