import { moment } from "obsidian";

/**
 * Gets the dates in the entire week that the date is in.
 *
 * @param {moment.Moment} date - The date to get dates for.
 * @returns {moment.Moment[]} Returns the dates in the week.
 */
export function getDatesInWeekByDate(date: moment.Moment): moment.Moment[] {
	const daysInWeek = [];
	const startOfWeek = date.clone().startOf('week');
	const endOfWeek = startOfWeek.clone().endOf('week');

	let currentDay = startOfWeek;
	while (currentDay.isSameOrBefore(endOfWeek, 'day')) {
		daysInWeek.push(currentDay.clone());
		currentDay.add(1, 'day');
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
	return this.currentDate = moment(filename.split(".")[0], dateFormat);
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
