import { moment, Plugin, Notice, MarkdownView } from 'obsidian';
import { appHasDailyNotesPluginLoaded, createDailyNote, getAllDailyNotes, getDailyNote } from 'obsidian-daily-notes-interface';
import { createDailyNoteNavbar } from './daily-note-navbar';
import { DailyNoteNavbarSettings, DEFAULT_SETTINGS, DailyNoteNavbarSettingTab } from './settings';
import { getDateFromFileName, getDatesInWeekByDate, hideChildren, showChildren } from './utils';

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
				const fileDate = getDateFromFileName(activeFile.name, this.settings.dailyNoteDateFormat);
				const isDailyNoteFile = fileDate.isValid(); 

				if (!isDailyNoteFile) {
					// Remove display none from title header elements
					showChildren(viewHeaderTitleEl);
					continue;
				}
				
				// Get visible dates
				const dates = getDatesInWeekByDate(fileDate.clone().add(this.weekOffset, "week"));
				// Hide other title header elements
				hideChildren(viewHeaderTitleEl);
				// Create daily note bar
				createDailyNoteNavbar(viewHeaderTitleEl, {
					currentDate: fileDate,
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
						const dailyNote = getDailyNote(date, getAllDailyNotes()) ?? await createDailyNote(date);
						await this.app.workspace.openLinkText(dailyNote.path, "", event.ctrlKey, {
							active: true,
						});
						this.weekOffset = 0;
					}
				});
			}
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

