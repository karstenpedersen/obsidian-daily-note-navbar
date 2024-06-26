import { Plugin, TFile, Notice, MarkdownView } from 'obsidian';
import { DailyNoteNavbarSettings, DEFAULT_SETTINGS, DailyNoteNavbarSettingTab } from './settings';
import { FileOpenType } from './types';
import { getDateFromFileName, getDailyNoteFile, hideChildren, showChildren } from './utils';
import DailyNoteNavbar from './dailyNoteNavbar/dailyNoteNavbar';

/**
 * This class is the actual Obsidian plugin.
 */
export default class DailyNoteNavbarPlugin extends Plugin {
	settings: DailyNoteNavbarSettings;
	navbars: Record<string, DailyNoteNavbar> = {};
	nextNavbarId = 0;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new DailyNoteNavbarSettingTab(this.app, this));
		this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.addDailyNoteNavbar()));
	}

	async addDailyNoteNavbar() {
		if (!this.hasDependencies()) {
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

			// Get view header title container
			const viewHeaderTitleContainers = view.containerEl.getElementsByClassName("view-header-title-container");
			if (viewHeaderTitleContainers.length !== 1) {
				continue;
			}
			const titleContainerEl = viewHeaderTitleContainers[0] as HTMLElement;

			// Check for navbar
			let navbar: DailyNoteNavbar | undefined;
			const navbars = view.containerEl.getElementsByClassName("daily-note-navbar");
			if (navbars.length > 0) {
				const navbarEl = navbars[0];
				const navbarId = navbarEl.getAttribute("id");
				if (navbarId) {
					navbar = this.getNavbar(navbarId);
				}
			}

			// Check if file is a daily note file or a normal file
			const fileDate = getDateFromFileName(activeFile.basename, this.settings.dailyNoteDateFormat);
			if (!fileDate.isValid()) {
				if (navbar) {
					this.removeNavbar(navbar.id);
				}
				// Remove display none from title header elements
				showChildren(titleContainerEl);
				continue;
			}
			
			if (navbar) {
				navbar.rerender();
			} else {
				// Hide other title header elements
				hideChildren(titleContainerEl);
				// Create daily note navbar for this view
				this.createNavbar(titleContainerEl, fileDate);
			}
		}
	}

	createNavbar(parentEl: HTMLElement, date: moment.Moment) {
		const id = `${this.nextNavbarId++}`;
		const navbar = new DailyNoteNavbar(this, id, parentEl, date);
		this.navbars[navbar.id];
	}

	removeNavbar(id: string) {
		const navbar = this.navbars[id];
		navbar.parentEl.removeChild(navbar.containerEl);
		delete this.navbars[id];
	}

	getNavbar(id: string): DailyNoteNavbar | undefined {
		return this.navbars[id];
	}

	async openDailyNote(date: moment.Moment, openType: FileOpenType) {
		const dailyNote = await getDailyNoteFile(date);
		this.openFile(dailyNote, openType);
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

	hasDependencies() {
		// @ts-ignore
		const periodicNotes = this.app.plugins.getPlugin("periodic-notes");

		if (!periodicNotes) {
			new Notice("Daily Note Navbar: Install Periodic Notes");
			return false;
		}

		if (!periodicNotes.settings?.daily?.enabled) {
			new Notice("Daily Note Navbar: Enable Periodic Notes Daily Notes");
			return false;
		}

		return true;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

