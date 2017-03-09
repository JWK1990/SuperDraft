var td;
var dID;
var link;

for(var i=1; i < document.getElementById("table").getElementsByTagName("tr").length; i++){
	td = document.getElementById("table").getElementsByTagName("tr")[i].getElementsByTagName("td")[5];

	dID = document.getElementById("table").getElementsByTagName("tr")[i].getElementsByTagName("td")[3].innerHTML;

	link = "/draft?draft=" + dID;
	td.addEventListener("click", function(){
		window.open(link)
	});
};