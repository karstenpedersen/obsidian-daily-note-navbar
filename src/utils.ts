import { moment } from "obsidian";
import { FirstDayOfWeek } from "./types";

/**
 * Gets the dates in the entire week that the date is in.
 *
 * @param {moment.Moment} date - The date to get dates for.
 * @returns {moment.Moment[]} Returns the dates in the week.
 */
export function getDatesInWeekByDate(date: moment.Moment, firstDayOfWeek: FirstDayOfWeek): moment.Moment[] {
	let startOfWeek = date.clone().startOf('isoWeek');
	if (firstDayOfWeek === "Sunday" && date.weekday() === 6) {
		startOfWeek = date.clone();
	} else if (firstDayOfWeek === "Sunday") {
		startOfWeek.subtract(1, "day");
	}

	const daysInWeek = [];
	for (let i = 0; i < 7; i++) {
		daysInWeek.push(startOfWeek.clone().add(i, 'days'));
	}

	return daysInWeek;
}

/**
 * Gets date based on given filename.
 *
 * @param {string} filename - The filename to get date from.
 * @param {string} dateFormat - The date format of the filename.
 * @returns {moment.Moment} Returns the date or null if there is no date.
 */
export function getDateFromFileName(filename: string, dateFormat: string): moment.Moment {
	return this.currentDate = moment(filename.split(".")[0], dateFormat, true);
}

/**
 * Hides all children in element.
 *
 * @param {HTMLElement} el - The parent element which children to hide.
 */
export function hideChildren(el: HTMLElement) {
	for (let k = 0; k < el.children.length; k++) {
		el.children[k].addClass("daily-note-navbar__hidden");
	}
}

/**
 * Shows all children in element.
 *
 * @param {HTMLElement} el - The parent element which children to show.
 */
export function showChildren(el: HTMLElement) {
	for (let k = 0; k < el.children.length; k++) {
		el.children[k].removeClass("daily-note-navbar__hidden");
	}
}

/**
 * Converts array of strings into record.
 *
 * @param {string[]} arr - The array of strings to convert to record.
 * @return {Record<string, string>} Returns the created record.
 */
export function toRecord(arr: string[]): Record<string, string> {
	const recordObject: Record<string, string> = {};
	arr.forEach(item => recordObject[item] = item)
	return recordObject;
}
