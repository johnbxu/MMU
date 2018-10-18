$(() => {
  $('#submitOrder').click(function (event) {
    event.preventDefault();
    const order = []
    const id = $('#submitOrder').attr('rurl');
    Array.from($('#sortable')
      .children('.sortableContainer'))
      .forEach((child) => {
        order.push(Number(child.id));
      });
    console.log(order);
    console.log(id);
    $.ajax({
      url: `/polls/${id}`,
      method: 'PUT',
      data: {obj: order},
      dataType: JSON,
      success: function(result) {
        console.log(result);
      }
    })
  });



});
