$(() => {
	$("#submitNewPoll").click(function (event) {
		event.preventDefault();
		const formVariables = {};
		formVariables["options"] = [];
		let temporaryInputArray = [];

		$("#responses .option :input").each(function(){
			temporaryInputArray.push($(this).val());
		});

		for(let i = 0; i < temporaryInputArray.length; i += 2) {
			let tempObj = {};
			tempObj["response"] = temporaryInputArray[i];
			tempObj["description"] = temporaryInputArray[i+1];
			formVariables.options.push(tempObj);
		}
    
		formVariables.question = $("#question").val();
		formVariables.name = $("#name").val();
		formVariables.email = $("#email").val();
		formVariables.end = new Date($("#end").val()).toISOString();

		$.ajax({
			url: "/polls/new",
			method: "POST",
			data: formVariables,
			dataType: "json"
		}).done(function(response) {
			window.location.href = "http://localhost:8080"+response.url;
		});
	});
});
