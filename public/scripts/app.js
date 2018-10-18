$(() => {
  let count = 3;
  let maxCount = 3;


  // clicking new option button will add an input textbox
  $('.newOption').click(function() {
    // $('.newOption').preventDefault();
    $('.options')
      .append($(`<input type="text" class="option" name="option${count}" id="option${count}">`));
    count += 1;
  })
  $('.deleteOption').click(function() {
    if (count > 3) {
      $(`.option:last-child`).remove();
      count -= 1;
    }
  })
});
