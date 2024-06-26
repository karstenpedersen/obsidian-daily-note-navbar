import { ButtonComponent, Notice, Menu, moment } from "obsidian";
import { getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";
import { getDatesInWeekByDate } from "../utils"; 
import { FileOpenType } from "../types"; 
import { FILE_OPEN_TYPES_MAPPING } from "./consts";
import { getDailyNoteFile } from "../utils";
import DailyNoteNavbarPlugin from "../main";

export default class DailyNoteNavbar {
	id: string;
	date: moment.Moment;
	weekOffset = 0;
	plugin: DailyNoteNavbarPlugin;
	containerEl: HTMLElement;
	parentEl: HTMLElement;

	constructor(plugin: DailyNoteNavbarPlugin, id: string, parentEl: HTMLElement, date: moment.Moment) {
		this.id = id;
		this.date = date;
		this.weekOffset = 0;
		this.plugin = plugin;

		this.containerEl = createDiv();
		this.containerEl.addClass("daily-note-navbar");
		this.containerEl.setAttribute("id", this.id);
		this.parentEl = parentEl;
		this.parentEl.appendChild(this.containerEl);

		this.rerender();
	}

	rerender() {
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
				.setTooltip(`${date.format(this.plugin.settings.tooltipDateFormat)}`)
				.onClick(async (event: MouseEvent) => {
					this.plugin.openDailyNote(date, event.ctrlKey ? "New tab" : this.plugin.settings.defaultOpenType);
				});
			if (isCurrent) {
				button.setClass("daily-note-navbar__current");
			}

			// Add context menu
			button.buttonEl.onClickEvent((event: MouseEvent) => {
				if (event.type === "auxclick") {
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
