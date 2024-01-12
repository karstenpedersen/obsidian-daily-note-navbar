import { ButtonComponent } from "obsidian";
import { getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";

interface DailyNoteNavbarProps {
	currentDate: moment.Moment;
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
	currentDate,
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

	// Create buttons
	new ButtonComponent(containerEl)
		.setClass("daily-note-navbar__change-week")
		.setIcon("left-arrow")
		.setTooltip("Previous week")
		.onClick(handleClickPrevious);

	for (const date of dates) {
		const isCurrent = currentDate.format("YYYY-MM-DD") === date.format("YYYY-MM-DD"); 
		const exists = getDailyNote(date, getAllDailyNotes());
		const stateClass = isCurrent ? "daily-note-navbar__current" : exists ? "daily-note-navbar__default" : "daily-note-navbar__not-exists"; 

		new ButtonComponent(containerEl)
			.setClass("daily-note-navbar__date")
			.setClass(stateClass)
			.setDisabled(isCurrent)
			.setButtonText(`${date.format(dateFormat)} ${date.date()}`)
			.setTooltip(`${date.format(tooltipDateFormat)}`)
			.onClick(async (event: MouseEvent) => {
				handleClickDate(event, date);
			});
	}

	new ButtonComponent(containerEl)
		.setClass("daily-note-navbar__change-week")
		.setIcon("right-arrow")
		.setTooltip("Next week")
		.onClick(handleClickNext);
}

