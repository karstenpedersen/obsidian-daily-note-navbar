import { App, PluginSettingTab, Setting } from "obsidian";
import { FirstDayOfWeek, FIRST_DAY_OF_WEEK, FileOpenType, FILE_OPEN_TYPES } from "./types";
import { toRecord } from "./utils";
import DailyNoteBarPlugin from "./main";

export interface DailyNoteNavbarSettings {
	dateFormat: string;
	tooltipDateFormat: string;
	dailyNoteDateFormat: string;
	firstDayOfWeek: FirstDayOfWeek;
	defaultOpenType: FileOpenType;
	setActive: boolean;
}

/**
 * The plugins default settings.
 */
export const DEFAULT_SETTINGS: DailyNoteNavbarSettings = {
	dateFormat: "ddd",
	tooltipDateFormat: "YYYY-MM-DD",
	dailyNoteDateFormat: "YYYY-MM-DD",
	firstDayOfWeek: "Monday",
	defaultOpenType: "Active",
	setActive: true
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

		// Daily note name format
		new Setting(containerEl)
			.setName('Daily note date format')
			.setDesc('Date format for daily notes.')
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.dailyNoteDateFormat)
				.setValue(this.plugin.settings.dailyNoteDateFormat)
				.onChange(async (value) => {
					if (value.trim() === "") {
						value = DEFAULT_SETTINGS.dailyNoteDateFormat;
					}
					this.plugin.settings.dailyNoteDateFormat = value;
					await this.plugin.saveSettings();
					this.plugin.addDailyNoteNavbar();
				}));

		// Date format
		new Setting(containerEl)
			.setName('Date format')
			.setDesc('Date format for the daily note bar.')
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.dateFormat)
				.setValue(this.plugin.settings.dateFormat)
				.onChange(async (value) => {
					if (value.trim() === "") {
						value = DEFAULT_SETTINGS.dateFormat;
					}
					this.plugin.settings.dateFormat = value;
					await this.plugin.saveSettings();
					this.plugin.addDailyNoteNavbar();
				}));

		// Tooltip date format
		new Setting(containerEl)
			.setName('Tooltip date format')
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
					this.plugin.addDailyNoteNavbar();
				}));

		// First day of week
		new Setting(containerEl)
			.setName('First day of week')
			.setDesc('The first day in the daily note bar.')
			.addDropdown(dropdown => dropdown
				.addOptions(toRecord(FIRST_DAY_OF_WEEK.map((item) => item)))
				.setValue(this.plugin.settings.firstDayOfWeek)
				.onChange(async (value: FirstDayOfWeek) => {
					this.plugin.settings.firstDayOfWeek = value;
					await this.plugin.saveSettings();
					this.plugin.addDailyNoteNavbar();
				}));

		// Set active
		new Setting(containerEl)
			.setName('Open files as active')
			.setDesc('Make files active when they are opened.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.setActive)
				.onChange(async value => {
					this.plugin.settings.setActive = value;
					this.plugin.saveSettings();
				}));

		// File open type
		new Setting(containerEl)
			.setName('Open in')
			.setDesc('Where to open files.')
			.addDropdown(dropdown => dropdown
				.addOptions(toRecord(FILE_OPEN_TYPES.map((item) => item)))
				.setValue(this.plugin.settings.defaultOpenType)
				.onChange(async (value: FileOpenType) => {
					this.plugin.settings.defaultOpenType = value;
					await this.plugin.saveSettings();
					this.plugin.addDailyNoteNavbar();
				}));
	}
}
