import { App, ButtonComponent, moment, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, View, FileView } from 'obsidian';
import { getDateFromFileName, getDatesInWeekByDate } from './utils';
import { createDailyNote, getAllDailyNotes, getDailyNote, getDateFromFile } from 'obsidian-daily-notes-interface';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	currentDate = moment();
	weekOffset = 0;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.addDailyNoteBar();
		});

		this.app.workspace.on("file-open", () => {
			this.addDailyNoteBar();
		});
	}

	onunload() {

	}

	async addDailyNoteBar() {
		const views = this.app.workspace.getLeavesOfType("markdown");
		for (const view of views) {
			const elements = (view.view as View).containerEl.getElementsByClassName("view-header-title-container");
			console.log(elements);
			for (let i = 0; i < elements.length; i++) {
				const element = elements[i] as HTMLElement;

				const activeFile = (view.view as FileView).file;
				if (!activeFile) {
					continue;
				}

				const fileDate = getDateFromFileName(activeFile.name);
				console.log(fileDate.isValid())
				if (!fileDate.isValid()) {
					continue;
				}

				const dates = getDatesInWeekByDate(fileDate.clone().add(this.weekOffset, "week"));

				element.innerHTML = "";
				const container = createDiv();
				container.addClass("daily-note-bar");
				element.appendChild(container);

				new ButtonComponent(container).setIcon("left-arrow").setClass("daily-note-bar__change-week").onClick(() => {
					this.weekOffset--;
					this.addDailyNoteBar();
				});
				for (const date of dates) {
					const isCurrent = fileDate.format("YYYY-MM-DD") === date.format("YYYY-MM-DD"); 
					const exists = getDailyNote(date, getAllDailyNotes());
					const stateClass = isCurrent ? "daily-note-bar__current" : exists ? "daily-note-bar__default" : "daily-note-bar__not-exists"; 
					new ButtonComponent(container)
						.setClass("daily-note-bar__date")
						.setClass(stateClass)
						.setDisabled(isCurrent)
						.setButtonText(`${date.format("ddd")} ${date.date()}`)
					    .onClick(async (event: MouseEvent) => {
							const dailyNote = getDailyNote(date, getAllDailyNotes()) ?? await createDailyNote(date);
							await this.app.workspace.openLinkText(dailyNote.path, "", event.ctrlKey, {
								active: true,
							});
							this.weekOffset = 0;
						});
				}
				new ButtonComponent(container).setIcon("right-arrow").setClass("daily-note-bar__change-week").onClick(() => {
					this.weekOffset++;
					this.addDailyNoteBar();
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

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
