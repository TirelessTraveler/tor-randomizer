var rolelist_presets = {
	"All Any": new Array(15).fill("Any"),
	"Uprising Ranked": ["Cult Order",
		"Cult Investigative",
		"Cult Guardian",
		"Random Cult",
		"Random Cult",
		"Random Cult",
		"Common Cult",
		"Random Uprising",
		"Random Uprising",
		"Rogue Outcast"],
	"Ghosts Ranked": ["Cult Order",
		"Cult Investigative",
		"Cult Support",
		"Random Cult",
		"Random Cult",
		"Random Cult",
		"Common Cult",
		"Ghost Killing",
		"Random Ghost",
		"Random Ghost"],
	"Rogues Ranked": ["Cult Order",
		"Cult Investigative",
		"Cult Guardian",
		"Random Cult",
		"Random Cult",
		"Random Cult",
		"Cult Negative",
		"Rogue Killing",
		"Rogue Outcast",
		"Rogue Outcast",
	"Saints Ranked": ["Cult Order",
		 "Cult Investigative",
		 "Cult Fabled",
		 "Random Cult",
		 "Random Cult",
		 "Random Cult",
		 "Random Cult",
		 "Cult Negative",
		 "Saint Vessel",
		 "Rogue Outcast",
};
$(function() {
	$("#rolelist-presets").append('<option selected>');
	for(var x in rolelist_presets) {
		var el = $("<option>");
		el.text(x);
		$("#rolelist-presets").append(el);
	}
	$("#rolelist-presets").change(function() {
		var x = $("#rolelist-presets").val();
		if(rolelist_presets[x]) {
			$("#rolelist").val(rolelist_presets[x].join("\n"));
		}
	});
	$("#rolelist").change(function() {
		$("#rolelist-presets").val("");
	});
});
