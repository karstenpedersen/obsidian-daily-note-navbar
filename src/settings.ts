import { App, PluginSettingTab, Setting } from "obsidian";
import { FirstDayOfWeek, FIRST_DAY_OF_WEEK, FileOpenType, FILE_OPEN_TYPES } from "./types";
import { toRecord } from "./utils";
import DailyNoteBarPlugin from "./main";

export interface DailyNoteNavbarSettings {
	// Daily Notes settings
	dateFormat: string;
	tooltipDateFormat: string;
	dailyNoteDateFormat: string;
	defaultOpenType: FileOpenType;

	// Weekly Notes settings
	enableWeeklyNoteButton: boolean;
	weeklyNoteDateFormat: string;
	weeklyNoteDisplayFormat: string;
	weeklyNoteOpenType: FileOpenType;

	// General settings
	firstDayOfWeek: FirstDayOfWeek;
	setActive: boolean;
	showExtraButtons: boolean;
}

/**
 * The plugins default settings.
 */
export const DEFAULT_SETTINGS: DailyNoteNavbarSettings = {
	// Daily Notes
	dateFormat: "ddd",
	tooltipDateFormat: "YYYY-MM-DD",
	dailyNoteDateFormat: "YYYY-MM-DD",
	defaultOpenType: "Active",

	// Weekly Notes
	enableWeeklyNoteButton: false,
	weeklyNoteDateFormat: "gggg-[W]ww",
	weeklyNoteDisplayFormat: "ww",
	weeklyNoteOpenType: "Active",

	// General
	firstDayOfWeek: "Monday",
	setActive: true,
	showExtraButtons: false
}

/**
 * This class is the plugins settings tab.
 */
export class DailyNoteNavbarSettingTab extends PluginSettingTab {
	plugin: DailyNoteBarPlugin;

	constructor(app: App, plugin: DailyNoteBarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		// ========== Daily Notes ==========
		containerEl.createEl('h2', { text: 'Daily Notes' });

		new Setting(containerEl)
			.setName('Daily note file format')
			.setDesc('Date format for daily note filenames.')
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.dailyNoteDateFormat)
				.setValue(this.plugin.settings.dailyNoteDateFormat)
				.onChange(async (value) => {
					if (value.trim() === "") {
						value = DEFAULT_SETTINGS.dailyNoteDateFormat;
					}
					this.plugin.settings.dailyNoteDateFormat = value;
					await this.plugin.saveSettings();
					this.plugin.rerenderNavbars();
				}));

		new Setting(containerEl)
			.setName('Daily note display format')
			.setDesc('Date format for displaying daily notes in the navbar.')
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.dateFormat)
				.setValue(this.plugin.settings.dateFormat)
				.onChange(async (value) => {
					if (value.trim() === "") {
						value = DEFAULT_SETTINGS.dateFormat;
					}
					this.plugin.settings.dateFormat = value;
					await this.plugin.saveSettings();
					this.plugin.rerenderNavbars();
				}));

		new Setting(containerEl)
			.setName('Daily note tooltip format')
			.setDesc('Date format for tooltips.')
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.tooltipDateFormat)
				.setValue(this.plugin.settings.tooltipDateFormat)
				.onChange(async (value) => {
					if (value.trim() === "") {
						value = DEFAULT_SETTINGS.tooltipDateFormat;
					}
					this.plugin.settings.tooltipDateFormat = value;
					await this.plugin.saveSettings();
					this.plugin.rerenderNavbars();
				}));

		new Setting(containerEl)
			.setName('Open daily notes in')
			.setDesc('Where to open daily notes.')
			.addDropdown(dropdown => dropdown
				.addOptions(toRecord(FILE_OPEN_TYPES.map((item) => item)))
				.setValue(this.plugin.settings.defaultOpenType)
				.onChange(async (value: FileOpenType) => {
					this.plugin.settings.defaultOpenType = value;
					await this.plugin.saveSettings();
				}));

		// ========== Weekly Notes ==========
		containerEl.createEl('h2', { text: 'Weekly Notes' });

		new Setting(containerEl)
			.setName('Enable weekly note button')
			.setDesc('Add a button to navigate to the weekly note for the current week.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableWeeklyNoteButton)
				.onChange(async value => {
					this.plugin.settings.enableWeeklyNoteButton = value;
					await this.plugin.saveSettings();
					this.plugin.rerenderNavbars();
				}));

		new Setting(containerEl)
			.setName('Weekly note file format')
			.setDesc('Date format for weekly note filenames (must match your Periodic Notes setting).')
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.weeklyNoteDateFormat)
				.setValue(this.plugin.settings.weeklyNoteDateFormat)
				.onChange(async (value) => {
					if (value.trim() === "") {
						value = DEFAULT_SETTINGS.weeklyNoteDateFormat;
					}
					this.plugin.settings.weeklyNoteDateFormat = value;
					await this.plugin.saveSettings();
					this.plugin.rerenderNavbars();
				}));

		new Setting(containerEl)
			.setName('Weekly note display format')
			.setDesc('Format for displaying the week number in the button.')
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.weeklyNoteDisplayFormat)
				.setValue(this.plugin.settings.weeklyNoteDisplayFormat)
				.onChange(async (value) => {
					if (value.trim() === "") {
						value = DEFAULT_SETTINGS.weeklyNoteDisplayFormat;
					}
					this.plugin.settings.weeklyNoteDisplayFormat = value;
					await this.plugin.saveSettings();
					this.plugin.rerenderNavbars();
				}));

		new Setting(containerEl)
			.setName('Open weekly notes in')
			.setDesc('Where to open weekly notes.')
			.addDropdown(dropdown => dropdown
				.addOptions(toRecord(FILE_OPEN_TYPES.map((item) => item)))
				.setValue(this.plugin.settings.weeklyNoteOpenType)
				.onChange(async (value: FileOpenType) => {
					this.plugin.settings.weeklyNoteOpenType = value;
					await this.plugin.saveSettings();
				}));

		// ========== General ==========
		containerEl.createEl('h2', { text: 'General' });

		new Setting(containerEl)
			.setName('First day of week')
			.setDesc('The first day in the daily note bar.')
			.addDropdown(dropdown => dropdown
				.addOptions(toRecord(FIRST_DAY_OF_WEEK.map((item) => item)))
				.setValue(this.plugin.settings.firstDayOfWeek)
				.onChange(async (value: FirstDayOfWeek) => {
					this.plugin.settings.firstDayOfWeek = value;
					await this.plugin.saveSettings();
					this.plugin.rerenderNavbars();
				}));

		new Setting(containerEl)
			.setName('Open files as active')
			.setDesc('Make files active when they are opened.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.setActive)
				.onChange(async value => {
					this.plugin.settings.setActive = value;
					this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show extra buttons')
			.setDesc('Show buttons for last Sunday and next Monday.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showExtraButtons)
				.onChange(async value => {
					this.plugin.settings.showExtraButtons = value;
					await this.plugin.saveSettings();
					this.plugin.rerenderNavbars();
				}));
	}
}
