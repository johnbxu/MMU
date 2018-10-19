$(() => {
	let count = 3;
	// clicking new option button will add an input textbox
	$("#newOption").click(function() {
		$(".options")
			.append(
				`<div class="option" style="display:flex; flex-direction:row">
            <input type="text" class="option form-group form-control" id="option${count}" placeholder="Your response here" style="margin-right:2rem">
            <input type="text" class="description form-group form-control" id="description1${count}" placeholder="Optional description"></input>
         </div>`
			);
		count++;
	});
	$("#deleteOption").click(function() {
		if (count > 3) {
			$(".option:last-child").remove();
			count--;
		}
	});
});

