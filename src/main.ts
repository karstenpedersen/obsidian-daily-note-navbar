import { moment, Plugin, FileView } from 'obsidian';
import { createDailyNote, getAllDailyNotes, getDailyNote } from 'obsidian-daily-notes-interface';
import { createDailyNoteBar } from './daily-note-bar';
import { DailyNoteBarSettings, DEFAULT_SETTINGS, SampleSettingTab } from './settings';
import { getDateFromFileName, getDatesInWeekByDate, hideChildren, showChildren } from './utils';

export default class DailyNoteBarPlugin extends Plugin {
	instance: DailyNoteBarPlugin;
	settings: DailyNoteBarSettings;
	currentDate = moment();
	weekOffset = 0;

	async onload() {
		this.instance = this;

		await this.loadSettings();

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.addDailyNoteBar();
		});
		this.app.workspace.on("active-leaf-change", () => {
			this.addDailyNoteBar();
		});
	}

	async addDailyNoteBar() {
		// Get markdown workspaces
		const workspaces = this.app.workspace.getLeavesOfType("markdown");

		for (const workspace of workspaces) {
			// Get view header title container
			const view = workspace.view;
			const viewHeaderTitleElements = view.containerEl.getElementsByClassName("view-header-title-container");

			for (let i = 0; i < viewHeaderTitleElements.length; i++) {
				// Check if view has an active file
				const activeFile = (view as FileView).file;
				if (!activeFile) {
					continue;
				}

				const viewHeaderTitleEl = viewHeaderTitleElements[i] as HTMLElement;

				// Remove old daily note bar
				const dailyNoteBarElements = view.containerEl.getElementsByClassName("daily-note-bar");
				for (let k = 0; k < dailyNoteBarElements.length; k++) {
					dailyNoteBarElements[k].remove();
				}

				// Check if file is a daily note file or a normal file
				const fileDate = getDateFromFileName(activeFile.name);
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
				createDailyNoteBar(viewHeaderTitleEl, {
					currentDate: fileDate,
					dates,
					dateFormat: this.settings.dateFormat,
					tooltipDateFormat: this.settings.tooltipDateFormat,
					handleClickPrevious: () => {
						this.weekOffset--;
						this.addDailyNoteBar();
					},
					handleClickNext: () => {
						this.weekOffset++;
						this.addDailyNoteBar();
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

