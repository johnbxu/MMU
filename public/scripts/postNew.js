$(() => {
  $('#submitNewPoll').click(function (event) {
    event.preventDefault();
    const formVariables = {};
    formVariables.options = [];

    $('#responses :input').each(function(){
      formVariables.options.push($(this).val());
    })
    formVariables.question = $("#question").val();
    formVariables.name = $("#name").val();
    formVariables.email = $("#email").val()
    formVariables.end = new Date($("#end").val()).toISOString();

    $.ajax({
      url: `/polls/new`,
      method: 'POST',
      data: formVariables,
      dataType: 'json'
    }).done(function(response) {
      console.log('asdasdasd');

      console.log(response);
        window.location.href = "http://localhost:8080"+response.url;

    })
  });
});
