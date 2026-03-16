import { View, moment, TFile } from "obsidian";
import { FirstDayOfWeek } from "./types";
import DailyNoteNavbar from "./dailyNoteNavbar/dailyNoteNavbar";
import {
	createDailyNote,
	getAllDailyNotes,
	getDailyNote,
	createWeeklyNote,
	getAllWeeklyNotes,
	getWeeklyNote
} from 'obsidian-daily-notes-interface';

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
 * Gets date based on given basename.
 *
 * @param {string} basename - The basename of the file.
 * @param {string} dateFormat - The date format of the filename.
 * @returns {moment.Moment} Returns the date or null if there is no date.
 */
export function getDateFromFileName(basename: string, dateFormat: string): moment.Moment {
	return moment(basename, dateFormat, true);
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

/**
 * Gets the daily note file for the given date.
 *
 * @note This creates the daily note if it doesn't aldready exist.
 * @param {moment.Moment} date - The date to get file for.
 * @return {TFile} Returns the daily note file.
 */
export async function getDailyNoteFile(date: moment.Moment): Promise<TFile> {
	return getDailyNote(date, getAllDailyNotes()) ?? await createDailyNote(date);
}

/**
 * Get navbar id from view if it exists.
 *
 * @param {MarkdownView} view - The view to select the navbar from.
 * @return {string | null} The navbar id or null.
 */
export function selectNavbarFromView(view: View): string | null {
	const navbars = view.containerEl.getElementsByClassName("daily-note-navbar");
	if (navbars.length > 0) {
		const navbarEl = navbars[0];
		return navbarEl.getAttribute("daily-note-navbar-id");
	}
	return null;
}

/**
 * Gets the date of the Sunday before the current week.
 *
 * @param {moment.Moment} date - The current date.
 * @param {FirstDayOfWeek} firstDayOfWeek - The first day of week setting.
 * @returns {moment.Moment} Returns the Sunday before the current week.
 */
export function getLastSunday(date: moment.Moment, firstDayOfWeek: FirstDayOfWeek): moment.Moment {
	const weekDates = getDatesInWeekByDate(date, firstDayOfWeek);
	const firstDayOfWeekDate = weekDates[0];

	// If first day of week is Monday, Sunday is one day before
	// If first day of week is Sunday, we need the previous week's Sunday
	if (firstDayOfWeek === "Monday") {
		return firstDayOfWeekDate.clone().subtract(1, "day");
	} else {
		// firstDayOfWeek is Sunday
		// The first element is Sunday of current week, so we want Sunday of previous week
		return firstDayOfWeekDate.clone().subtract(7, "days");
	}
}

/**
 * Gets the date of the Monday after the current week.
 *
 * @param {moment.Moment} date - The current date.
 * @param {FirstDayOfWeek} firstDayOfWeek - The first day of week setting.
 * @returns {moment.Moment} Returns the Monday after the current week.
 */
export function getNextMonday(date: moment.Moment, firstDayOfWeek: FirstDayOfWeek): moment.Moment {
	const weekDates = getDatesInWeekByDate(date, firstDayOfWeek);
	const lastDayOfWeekDate = weekDates[6]; // Last day of the week

	// If first day of week is Monday, the last day is Sunday, so Monday is one day after
	// If first day of week is Sunday, the last day is Saturday, so Monday is two days after
	if (firstDayOfWeek === "Monday") {
		return lastDayOfWeekDate.clone().add(1, "day");
	} else {
		// firstDayOfWeek is Sunday, last day is Saturday
		return lastDayOfWeekDate.clone().add(2, "days");
	}
}

/**
 * Gets the weekly note file for the given date.
 *
 * @note This creates the weekly note if it doesn't already exist.
 * @param {moment.Moment} date - The date to get file for.
 * @return {Promise<TFile>} Returns the weekly note file.
 */
export async function getWeeklyNoteFile(date: moment.Moment): Promise<TFile> {
	const allWeeklyNotes = getAllWeeklyNotes();
	return getWeeklyNote(date, allWeeklyNotes) ?? await createWeeklyNote(date);
}
