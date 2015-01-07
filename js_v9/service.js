function save(score){
	var formData = {score: score};
	$.ajax(
		{
			url : "http://localhost:8083/api/v1/score",
			type: "POST",
			contentType:"application/json",
			dataType: "json",
			data: JSON.stringify(formData)
		});
}

function getAll(){
	$.get("http://localhost:8083/api/v1/score",function (data, status){
		return data._embedded.score;
    });
}
