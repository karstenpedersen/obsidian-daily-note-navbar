import { moment, Plugin, TFile, Notice, MarkdownView } from 'obsidian';
import { appHasDailyNotesPluginLoaded } from 'obsidian-daily-notes-interface';
import { createDailyNoteNavbar } from './daily-note-navbar';
import { DailyNoteNavbarSettings, DEFAULT_SETTINGS, DailyNoteNavbarSettingTab } from './settings';
import { FileOpenType } from './types';
import { getDateFromFileName, getDatesInWeekByDate, getDailyNoteFile, hideChildren, showChildren } from './utils';

/**
 * This class is the actual Obsidian plugin.
 */
export default class DailyNoteNavbarPlugin extends Plugin {
	settings: DailyNoteNavbarSettings;
	currentDate = moment();
	weekOffset = 0;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new DailyNoteNavbarSettingTab(this.app, this));

		this.registerEvent(this.app.workspace.on("active-leaf-change", () => {
			this.weekOffset = 0;
			this.addDailyNoteNavbar();
		}));
	}

	async addDailyNoteNavbar() {
		// Check if daily notes are setup
		if (!appHasDailyNotesPluginLoaded) {
			new Notice("Daily Note Navbar: Periodic Notes daily notes plugin not loaded");
			return;
		} 

		// Get markdown leaves
		const leaves = this.app.workspace.getLeavesOfType("markdown");

		for (const leaf of leaves) {
			// Get view header title container
			const view = leaf.view as MarkdownView;
			// Check if view has an active file
			const activeFile = view.file;
			if (!activeFile) {
				continue;
			}

			const viewHeaderTitleElements = view.containerEl.getElementsByClassName("view-header-title-container");

			for (let i = 0; i < viewHeaderTitleElements.length; i++) {
				const viewHeaderTitleEl = viewHeaderTitleElements[i] as HTMLElement;

				// Remove old daily note bar
				const dailyNoteNavbarElements = view.containerEl.getElementsByClassName("daily-note-navbar");
				for (let k = 0; k < dailyNoteNavbarElements.length; k++) {
					dailyNoteNavbarElements[k].remove();
				}

				// Check if file is a daily note file or a normal file
				const fileDate = getDateFromFileName(activeFile.basename, this.settings.dailyNoteDateFormat);
				const isDailyNoteFile = fileDate.isValid(); 
				if (!isDailyNoteFile) {
					// Remove display none from title header elements
					showChildren(viewHeaderTitleEl);
					continue;
				}

				// Get visible dates
				const dates = getDatesInWeekByDate(fileDate.clone().add(this.weekOffset, "week"), this.settings.firstDayOfWeek);
				// Hide other title header elements
				hideChildren(viewHeaderTitleEl);
				// Create daily note bar
				createDailyNoteNavbar(this, viewHeaderTitleEl, {
					activeDate: fileDate,
					dates,
					dateFormat: this.settings.dateFormat,
					tooltipDateFormat: this.settings.tooltipDateFormat,
					handleClickPrevious: () => {
						this.weekOffset--;
						this.addDailyNoteNavbar();
					},
					handleClickNext: () => {
						this.weekOffset++;
						this.addDailyNoteNavbar();
					},
					handleClickDate: async (event: MouseEvent, date: moment.Moment) => {
						this.openDailyNote(date, event.ctrlKey ? "New tab" : this.settings.defaultOpenType);
					}
				});
			}
		}
	}

	async openDailyNote(date: moment.Moment, openType: FileOpenType) {
		const dailyNote = await getDailyNoteFile(date);
		this.openFile(dailyNote, openType);
		this.weekOffset = 0;
	}

	async openFile(file: TFile, openType: FileOpenType) {
		switch (openType) {
			case "New window":
				await this.app.workspace
					.getLeaf("window")
					.openFile(file, { active: this.settings.setActive });
				return;
			case "New tab":
				await this.app.workspace
					.getLeaf("tab")
					.openFile(file, { active: this.settings.setActive });
				return;
			case "Split right":
				await this.app.workspace
					.getLeaf("split", "vertical")
					.openFile(file, { active: this.settings.setActive });
				return;
			case "Split down":
				await this.app.workspace
					.getLeaf("split", "horizontal")
					.openFile(file, { active: this.settings.setActive });
				return;
			case "Active":
				await this.app.workspace
					.getLeaf()
					.openFile(file, { active: true });
				break;
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

