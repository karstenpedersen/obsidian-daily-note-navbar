"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showChildren = exports.hideChildren = exports.getDateFromFileName = exports.getDatesInWeekByDate = void 0;
var obsidian_1 = require("obsidian");
function getDatesInWeekByDate(date) {
    var daysInWeek = [];
    var startOfWeek = date.clone().startOf('week');
    var endOfWeek = startOfWeek.clone().endOf('week');
    var currentDay = startOfWeek;
    while (currentDay.isSameOrBefore(endOfWeek, 'day')) {
        daysInWeek.push(currentDay.clone());
        currentDay.add(1, 'day');
    }
    return daysInWeek;
}
exports.getDatesInWeekByDate = getDatesInWeekByDate;
function getDateFromFileName(filename) {
    return this.currentDate = (0, obsidian_1.moment)(filename.split(".")[0]);
}
exports.getDateFromFileName = getDateFromFileName;
function hideChildren(el) {
    for (var k = 0; k < el.children.length; k++) {
        el.children[k].addClass("daily-note-bar__hidden");
    }
}
exports.hideChildren = hideChildren;
function showChildren(el) {
    for (var k = 0; k < el.children.length; k++) {
        el.children[k].removeClass("daily-note-bar__hidden");
    }
}
exports.showChildren = showChildren;
