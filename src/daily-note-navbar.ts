import { ButtonComponent, moment } from "obsidian";
import { getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";

interface DailyNoteNavbarProps {
	activeDate: moment.Moment;
	dates: moment.Moment[];
	dateFormat: string;
	tooltipDateFormat: string;
	handleClickPrevious: (event: MouseEvent) => void;
	handleClickNext: (event: MouseEvent) => void;
	handleClickDate: (event: MouseEvent, date: moment.Moment) => Promise<void>;
}

/**
 * Creates a daily note navbar and adds it to parentEl.
 *
 * @param {HTMLElement} parentEl - The element to place the navbar in.
 * @param {DailyNoteNavbarProps} props - The navbars props.
 */
export function createDailyNoteNavbar(parentEl: HTMLElement, {
	activeDate,
	dates,
	dateFormat,
	tooltipDateFormat,
	handleClickPrevious,
	handleClickNext,
	handleClickDate
}: DailyNoteNavbarProps) {
	// Create container div
	const containerEl = createDiv();
	containerEl.addClass("daily-note-navbar");
	parentEl.appendChild(containerEl);

	const currentDate: moment.Moment = moment();

	// Create buttons
	new ButtonComponent(containerEl)
		.setClass("daily-note-navbar__change-week")
		.setIcon("left-arrow")
		.setTooltip("Previous week")
		.onClick(handleClickPrevious);

	for (const date of dates) {
		const dateString = date.format("YYYY-MM-DD");
		const isActive = activeDate.format("YYYY-MM-DD") === dateString;
		const isCurrent = currentDate.format("YYYY-MM-DD") === dateString;
		const exists = getDailyNote(date, getAllDailyNotes());
		const stateClass = isActive ? "daily-note-navbar__active" : exists ? "daily-note-navbar__default" : "daily-note-navbar__not-exists"; 

		const button = new ButtonComponent(containerEl)
			.setClass("daily-note-navbar__date")
			.setClass(stateClass)
			.setDisabled(isActive)
			.setButtonText(`${date.format(dateFormat)} ${date.date()}`)
			.setTooltip(`${date.format(tooltipDateFormat)}`)
			.onClick(async (event: MouseEvent) => {
				handleClickDate(event, date);
			});

		if (isCurrent) {
			button.setClass("daily-note-navbar__current");
		}
	}

	new ButtonComponent(containerEl)
		.setClass("daily-note-navbar__change-week")
		.setIcon("right-arrow")
		.setTooltip("Next week")
		.onClick(handleClickNext);
}

