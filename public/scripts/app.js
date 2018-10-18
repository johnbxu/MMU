$(() => {
  let count = 3;
  // clicking new option button will add an input textbox
  $('#newOption').click(function() {
    $('.options')
      .append($(`<input type="text" class="option form-group form-control" id="option${count}">`));
      count++;
  })
  $('#deleteOption').click(function() {
    if (count > 3) {
      $(`.option:last-child`).remove();
      count--;
    }
  })
});
