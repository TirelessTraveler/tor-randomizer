$(function() {
	$("#group_restrictions").val(group_restrictions.map(function(entry) {
		return entry.grouping.join(", ")+": "+entry.restrictions.join(", ");
	}).join("\n"));
	$("#group_restrictions").change(function() {
		var lines = $("#group_restrictions").val().split(/\r\n|\r|\n/);
		group_restrictions = lines.map(function(line) {
			var parts = line.split(":");
			return {
				grouping: parts[0].split(",").map(s=>s.trim()).filter(s=>s),
				restrictions: parts[1].split(",").map(s=>s.trim()).filter(s=>s),
			};
		});
	});
});
