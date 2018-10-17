$(() => {
  $.ajax({
    method: "GET",
    url: "/polls/"
  }).done((users) => {
    for(user of users) {
      $("<div>").text(user.name).appendTo($("body"));
    }
  });;
});
