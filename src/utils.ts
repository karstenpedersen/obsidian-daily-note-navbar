import { moment } from "obsidian";

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

export function getDateFromFileName(filename: string): moment.Moment {
	return this.currentDate = moment(filename.split(".")[0]);
}
