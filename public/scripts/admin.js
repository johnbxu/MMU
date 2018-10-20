$(() => {
  $(".deleteResponse").click(function (event) {
    const endpoint = $(this).attr("url");
    const responseId = {
      id: $(this).attr("responseId")
    }
    const randomURL = $(this).attr("randomURL");

    $.ajax({
      url: endpoint,
      method: "DELETE",
      data: responseId
    }).done(function (response) {
      console.log(response);
      if (response.message === "unauthorized") {
        alert('invalid login');
      } else if (response.message === "need at least 2 options") {
        alert("Cannot delete. You must have at least 2 options.")
      } else {
        window.location.href = "http://localhost:8080/polls/" + randomURL + "/admin";
      }
    })
  })

  // $("#updatePoll").click(function (event) {
	// 	event.preventDefault();
	// 	const formVariables = {};
	// 	formVariables["options"] = [];
	// 	let temporaryInputArray = [];
  //
	// 	$("#responses .option :input").each(function(){
	// 		temporaryInputArray.push($(this).val());
	// 	});
  //
	// 	for(let i = 0; i < temporaryInputArray.length; i += 2) {
	// 		let tempObj = {};
	// 		tempObj["response"] = temporaryInputArray[i];
	// 		tempObj["description"] = temporaryInputArray[i+1];
	// 		formVariables.options.push(tempObj);
	// 	}
  //
	// 	formVariables.question = $("#question").val();
	// 	formVariables.name = $("#name").val();
	// 	formVariables.email = $("#email").val();
	// 	formVariables.end = new Date($("#end").val()).toISOString();
  //
	// 	$.ajax({
	// 		url: "/polls/new",
	// 		method: "POST",
	// 		data: formVariables,
	// 		dataType: "json"
	// 	}).done(function(response) {
	// 		window.location.href = "http://localhost:8080"+response.url;
	// 	});
	// });
});
