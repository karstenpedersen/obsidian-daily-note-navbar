import { ButtonComponent, Menu, moment, Notice } from "obsidian";
import { getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";
import { getDailyNoteFile } from "./utils";
import { FileOpenType } from "./types";
import DailyNoteNavbarPlugin from "./main";

interface DailyNoteNavbarProps {
	activeDate: moment.Moment;
	dates: moment.Moment[];
	dateFormat: string;
	tooltipDateFormat: string;
	handleClickPrevious: (event: MouseEvent) => void;
	handleClickNext: (event: MouseEvent) => void;
	handleClickDate: (event: MouseEvent, date: moment.Moment) => Promise<void>;
}

type FileOpenTypeMapping = Record<Exclude<FileOpenType, "Active">, {icon: string, title: string}>;
const FILE_OPEN_TYPES_MAPPING: FileOpenTypeMapping = {
	"New tab": {
		icon: "file-plus",
		title: "Open in new tab"
	},
	"Split right": {
		icon: "separator-vertical",
		title: "Split right"
	},
	"Split down": {
		icon: "separator-vertical",
		title: "Split down"
	},
	"New window": {
		icon: "picture-in-picture-2",
		title: "Open in new window"
	}
};

/**
 * Creates a daily note navbar and adds it to parentEl.
 *
 * @param {DailyNoteNavbarPlugin} plugin - The plugin.
 * @param {HTMLElement} parentEl - The element to place the navbar in.
 * @param {DailyNoteNavbarProps} props - The navbars props.
 */
export function createDailyNoteNavbar(plugin: DailyNoteNavbarPlugin, parentEl: HTMLElement, {
	activeDate,
	dates,
	dateFormat,
	tooltipDateFormat,
	handleClickPrevious,
	handleClickNext,
	handleClickDate,
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

		// Add context menu
		button.buttonEl.onClickEvent((event: MouseEvent) => {
			if (event.type === "auxclick") {
				createContextMenu(plugin, event, date);
			}
		})
	}

	new ButtonComponent(containerEl)
		.setClass("daily-note-navbar__change-week")
		.setIcon("right-arrow")
		.setTooltip("Next week")
		.onClick(handleClickNext);
}

function createContextMenu(plugin: DailyNoteNavbarPlugin, event: MouseEvent, date: moment.Moment) {
	const menu = new Menu()

	for (const [openType, itemValues] of Object.entries(FILE_OPEN_TYPES_MAPPING)) {
		menu.addItem(item => item
			.setIcon(itemValues.icon)
			.setTitle(itemValues.title)
			.onClick(async () => {
				plugin.openDailyNote(date, openType as FileOpenType);
			}))
	}

	menu.addSeparator();

	menu.addItem(item => item
		.setIcon("copy")
		.setTitle("Copy Obsidian URL")
		.onClick(async () => {
			const dailyNote = await getDailyNoteFile(date);
			const extensionLength = dailyNote.extension.length > 0 ? dailyNote.extension.length + 1 : 0;
			const fileName = encodeURIComponent(dailyNote.path.slice(0, -extensionLength));
			const vaultName = plugin.app.vault.getName();
			const url = `obsidian://open?vault=${vaultName}&file=${fileName}`;
			navigator.clipboard.writeText(url);
			new Notice("URL copied to your clipboard");
		}));

	menu.showAtMouseEvent(event)
}
