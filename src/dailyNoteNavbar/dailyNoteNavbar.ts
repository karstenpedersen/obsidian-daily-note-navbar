import { ButtonComponent, MarkdownView, Notice, Menu, moment, Keymap, TFile } from "obsidian";
import { getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";
import { getDatesInWeekByDate, getDateFromFileName } from "../utils"; 
import { FileOpenType } from "../types"; 
import { FILE_OPEN_TYPES_MAPPING, FILE_OPEN_TYPES_TO_PANE_TYPE } from "./consts";
import { getDailyNoteFile } from "../utils";
import DailyNoteNavbarPlugin from "../main";

export async function getNumberOfRemainingTasks(note: TFile): Promise<number> {
	const { vault } = window.app;
	const fileContents = await vault.cachedRead(note);
	return (fileContents.match(/(-|\*) \[ \]/g) || []).length;
  }
  

export async function checkRemainingTasksExistance(
	dailyNote: TFile
  ): Promise<boolean> {
	return await getNumberOfRemainingTasks(dailyNote) > 0;
  }
  

export default class DailyNoteNavbar {
	id: string;
	
	date: moment.Moment;
	fileDate: moment.Moment;

	weekOffset = 0;
	plugin: DailyNoteNavbarPlugin;
	containerEl: HTMLElement;
	headerEl: HTMLElement;
	contentEl: HTMLElement;
	parentEl: HTMLElement;
	view: MarkdownView;

	constructor(plugin: DailyNoteNavbarPlugin, id: string, view: MarkdownView, parentEl: HTMLElement, fileDate: moment.Moment) {
		this.id = id;

		this.date = fileDate.clone();
		this.fileDate = fileDate.clone();

		this.weekOffset = 0;
		this.plugin = plugin;
		this.view = view;

		this.containerEl = createDiv();
		this.containerEl.addClass("daily-note-navbar");
		this.containerEl.setAttribute("daily-note-navbar-id", this.id);

		this.headerEl = createDiv();
		this.headerEl.addClass("daily-note-navbar__header");
		this.headerEl.addEventListener("click", () => {
			this.plugin.openDailyNote(moment(), "Active");
		});
		this.containerEl.appendChild(this.headerEl);
		
		this.contentEl = createDiv();
		this.contentEl.addClass("daily-note-navbar__content");
		this.containerEl.appendChild(this.contentEl);

		this.parentEl = parentEl;
		this.parentEl.appendChild(this.containerEl);

		// Remove navbar when view unloads
		this.view.onunload = () => this.plugin.removeNavbar(this.id);

		this.rerender();
	}

	renderHeader(headerEl: HTMLElement, date: moment.Moment) {
		headerEl.replaceChildren();

		const monthText = date.format("MMMM");
		const yearText = date.format("YYYY");

		const month = createSpan();
		month.innerText = monthText;
		month.addClass("daily-note-navbar__header__month");
		headerEl.appendChild(month);

		headerEl.appendChild(createEl("span", { text: "\u00A0" }));

		const year = createSpan();
		year.innerText = yearText;
		year.addClass("daily-note-navbar__header__year");
		headerEl.appendChild(year);
	}

	rerender() {
		// Update date from view if it has changed
		const activeFile = this.view.file;
		const fileDate = activeFile ? getDateFromFileName(activeFile.basename, this.plugin.settings.dailyNoteDateFormat) : null;
		if (fileDate && fileDate.format("YYYY-MM-DD") !== this.date.format("YYYY-MM-DD")) {
			this.date = fileDate;
			this.weekOffset = 0;
		}

		this.contentEl.replaceChildren();

		const currentDate = moment();
		const dates = getDatesInWeekByDate(this.date.clone().add(this.weekOffset, "week"), this.plugin.settings.firstDayOfWeek);

		this.renderHeader(this.headerEl, dates[3]);

		// Previous week button
		new ButtonComponent(this.contentEl)
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
			const dailyNoteFile = getDailyNote(date, getAllDailyNotes());
			const stateClass = isActive
				? "daily-note-navbar__active"
				: dailyNoteFile
					? "daily-note-navbar__default"
					: "daily-note-navbar__not-exists";

			const button = new ButtonComponent(this.contentEl)
				.setButtonText(date.format("DD"))
				.setClass("daily-note-navbar__date")
				.setClass(stateClass)
				.setTooltip(`${date.format(this.plugin.settings.tooltipDateFormat)}`);


			if (dailyNoteFile) {
				checkRemainingTasksExistance(dailyNoteFile)
					.then((remainingTasks) => {
						if (remainingTasks) {
							button.setClass("daily-note-navbar__undone");
						} else {
							button.setClass("daily-note-navbar__done");
						}
					})
					.catch((error) => {
						console.error(`obsidian-daily-note-navbar-v2 error for file=[${dateString}]`, error);
					});
			} else {
				button.setClass("daily-note-navbar__not-exists");
			}
			
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
					const openType = event.ctrlKey ? "New tab" : this.plugin.settings.defaultOpenType;
					// Skip as it is already open
					const isActive = this.date.format("YYYY-MM-DD") === date.format("YYYY-MM-DD");
					if (isActive && openType === "Active") {
						return;
					}
					this.plugin.openDailyNote(date, openType);
				} else if (event.type === "auxclick") {
					this.createContextMenu(event, date);
				}
			});
		}

		// Next week button
		new ButtonComponent(this.contentEl)
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
