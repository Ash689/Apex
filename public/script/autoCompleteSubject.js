$(function() {

    $("#subject").autocomplete({
        source: availableSubjects,
        minLength: 0,
        select: function(event, ui) {
            $("#subject").val(ui.item.value);
            return false;
        }
    }).focus(function() {
        $(this).autocomplete("search", "");
    });

    
    $("#qualification").autocomplete({
        source: qualifications,
        minLength: 0,
        select: function(event, ui) {
            $("#qualification").val(ui.item.value);
            return false;
        }
    }).focus(function() {
        $(this).autocomplete("search", "");
    });

    $("#studyExamBoard").autocomplete({
        source: examBoards,
        minLength: 0,
        select: function(event, ui) {
            $("#studyExamBoard").val(ui.item.value);
            return false;
        }
    }).focus(function() {
        $(this).autocomplete("search", "");
    });

    $("#expectedGrade").autocomplete({
        source: grades,
        minLength: 0,
        select: function(event, ui) {
            $("#expectedGrade").val(ui.item.value);
            return false;
        }
    }).focus(function() {
        $(this).autocomplete("search", "");
    });

    $("#desiredGrade").autocomplete({
        source: grades,
        minLength: 0,
        select: function(event, ui) {
            $("#desiredGrade").val(ui.item.value);
            return false;
        }
    }).focus(function() {
        $(this).autocomplete("search", "");
    });
});