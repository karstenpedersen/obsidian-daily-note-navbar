import { ButtonComponent, MarkdownView, Notice, Menu, moment, Keymap } from "obsidian";
import { getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";
import { getDatesInWeekByDate, getDateFromFileName } from "../utils"; 
import { FileOpenType } from "../types"; 
import { FILE_OPEN_TYPES_MAPPING, FILE_OPEN_TYPES_TO_PANE_TYPE } from "./consts";
import { getDailyNoteFile } from "../utils";
import DailyNoteNavbarPlugin from "../main";

export default class DailyNoteNavbar {
	id: string;
	date: moment.Moment;
	weekOffset = 0;
	plugin: DailyNoteNavbarPlugin;
	containerEl: HTMLElement;
	parentEl: HTMLElement;
	view: MarkdownView;

	constructor(plugin: DailyNoteNavbarPlugin, id: string, view: MarkdownView, parentEl: HTMLElement, date: moment.Moment) {
		this.id = id;
		this.date = date;
		this.weekOffset = 0;
		this.plugin = plugin;
		this.view = view;

		this.containerEl = createDiv();
		this.containerEl.addClass("daily-note-navbar");
		this.containerEl.setAttribute("daily-note-navbar-id", this.id);
		this.parentEl = parentEl;
		this.parentEl.appendChild(this.containerEl);

		// Remove navbar when view unloads
		this.view.onunload = () => this.plugin.removeNavbar(this.id);

		this.rerender();
	}

	rerender() {
		// Update date from view if it has changed
		const activeFile = this.view.file;
		const fileDate = activeFile ? getDateFromFileName(activeFile.basename, this.plugin.settings.dailyNoteDateFormat) : null;
		if (fileDate && fileDate.format("YYYY-MM-DD") !== this.date.format("YYYY-MM-DD")) {
			this.date = fileDate;
			this.weekOffset = 0;
		}
		this.containerEl.replaceChildren();

		const currentDate = moment();
		const dates = getDatesInWeekByDate(this.date.clone().add(this.weekOffset, "week"), this.plugin.settings.firstDayOfWeek);

		// Previous week button
		new ButtonComponent(this.containerEl)
			.setClass("daily-note-navbar__change-week")
			.setIcon("left-arrow")
			.setTooltip("Previous week")
			.onClick(() => {
				this.weekOffset--;
				this.rerender();
			});

		// Daily note buttons
		for (const date of dates) {
			const dateString = date.format("YYYY-MM-DD");
			const isActive = this.date.format("YYYY-MM-DD") === dateString;
			const isCurrent = currentDate.format("YYYY-MM-DD") === dateString;
			const exists = getDailyNote(date, getAllDailyNotes());
			const stateClass = isActive ? "daily-note-navbar__active" : exists ? "daily-note-navbar__default" : "daily-note-navbar__not-exists"; 

			const button = new ButtonComponent(this.containerEl)
				.setClass("daily-note-navbar__date")
				.setClass(stateClass)
				.setDisabled(isActive)
				.setButtonText(`${date.format(this.plugin.settings.dateFormat)} ${date.date()}`)
				.setTooltip(`${date.format(this.plugin.settings.tooltipDateFormat)}`);
			if (isCurrent) {
				button.setClass("daily-note-navbar__current");
			}

			// Add context menu
			button.buttonEl.onClickEvent((event: MouseEvent) => {
				const paneType = Keymap.isModEvent(event);
				if (paneType && paneType !== true) {
					const openType = FILE_OPEN_TYPES_TO_PANE_TYPE[paneType];
					this.plugin.openDailyNote(date, openType);
				} else if (event.type === "click") {
					this.plugin.openDailyNote(date, event.ctrlKey ? "New tab" : this.plugin.settings.defaultOpenType);
				} else if (event.type === "auxclick") {
					this.createContextMenu(event, date);
				}
			});
		}

		// Next week button
		new ButtonComponent(this.containerEl)
			.setClass("daily-note-navbar__change-week")
			.setIcon("right-arrow")
			.setTooltip("Next week")
			.onClick(() => {
				this.weekOffset++;
				this.rerender();
			});
	}

	createContextMenu(event: MouseEvent, date: moment.Moment) {
		const menu = new Menu()

		for (const [openType, itemValues] of Object.entries(FILE_OPEN_TYPES_MAPPING)) {
			menu.addItem(item => item
				.setIcon(itemValues.icon)
				.setTitle(itemValues.title)
				.onClick(async () => {
					this.plugin.openDailyNote(date, openType as FileOpenType);
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
				const vaultName = this.plugin.app.vault.getName();
				const url = `obsidian://open?vault=${vaultName}&file=${fileName}`;
					navigator.clipboard.writeText(url);
				new Notice("URL copied to your clipboard");
			}));

		menu.showAtMouseEvent(event)
	}
}
