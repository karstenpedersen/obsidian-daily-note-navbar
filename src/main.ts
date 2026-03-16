import { Plugin, TFile, Notice, MarkdownView, WorkspaceLeaf } from 'obsidian';
import { DailyNoteNavbarSettings, DEFAULT_SETTINGS, DailyNoteNavbarSettingTab } from './settings';
import { FileOpenType } from './types';
import { getDateFromFileName, getDailyNoteFile, getWeeklyNoteFile, hideChildren, showChildren, selectNavbarFromView } from './utils';
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
		this.registerEvent(this.app.workspace.on("active-leaf-change", (leaf: WorkspaceLeaf) => {
			this.addDailyNoteNavbar(leaf);
		}));
		this.registerEvent(this.app.workspace.on("css-change", () => this.rerenderNavbars()));
		this.registerEvent(this.app.vault.on("create", () => this.rerenderNavbars()));
		this.registerEvent(this.app.vault.on("rename", () => this.rerenderNavbars()));
		this.registerEvent(this.app.vault.on("delete", () => this.rerenderNavbars()));
	}

	async addDailyNoteNavbar(leaf: WorkspaceLeaf) {
		if (!this.hasDependencies()) {
			return;
		}

		// Check for markdown view and file
		const markdownLeaves = this.app.workspace.getLeavesOfType("markdown");
		if (!markdownLeaves.includes(leaf)) {
			return;
		}
		const view = leaf.view as MarkdownView;
		const activeFile = view.file;
		if (!activeFile) {
			return;
		}

		// Get view header title container
		const viewHeaderTitleContainers = view.containerEl.getElementsByClassName("view-header-title-container");
		if (viewHeaderTitleContainers.length !== 1) {
			return;
		}
		const titleContainerEl = viewHeaderTitleContainers[0] as HTMLElement;

		// Get navbar if one is attached to the view
		const navbarId = selectNavbarFromView(view);
		const navbar = navbarId ? this.getNavbar(navbarId) : null;

		// Check if file is a daily note file or a normal file
		const fileDate = getDateFromFileName(activeFile.basename, this.settings.dailyNoteDateFormat);
		if (!fileDate.isValid()) {
			if (navbar) {
				this.removeNavbar(navbar.id);
				showChildren(titleContainerEl);
			}
			return;
		}
		
		if (navbar) {
			// Reuse navbar for new file
			navbar.rerender();
		} else {
			hideChildren(titleContainerEl);
			this.createNavbar(view, titleContainerEl, fileDate);
		}
	}

	createNavbar(view: MarkdownView, parentEl: HTMLElement, date: moment.Moment): DailyNoteNavbar {
		const navbarId = `${this.nextNavbarId++}`;
		const navbar = new DailyNoteNavbar(this, navbarId, view, parentEl, date);
		this.navbars[navbarId] = navbar;
		return navbar;
	}

	removeNavbar(id: string) {
		const navbar = this.navbars[id];
		navbar.parentEl.removeChild(navbar.containerEl);
		delete this.navbars[id];
	}

	getNavbar(id: string): DailyNoteNavbar | undefined {
		return this.navbars[id];
	}

	rerenderNavbars() {
		for (const navbar of Object.values(this.navbars)) {
			navbar.rerender();
		}
	}

	async openDailyNote(date: moment.Moment, openType: FileOpenType) {
		const dailyNote = await getDailyNoteFile(date);
		this.openFile(dailyNote, openType);
	}

	async openWeeklyNote(date: moment.Moment, openType: FileOpenType) {
		if (!this.hasWeeklyNotesDependencies()) {
			new Notice("Weekly Notes are not enabled. Please enable them in Periodic Notes.");
			return;
		}

		try {
			const weeklyNote = await getWeeklyNoteFile(date);
			this.openFile(weeklyNote, openType);
		} catch (error) {
			console.error("Failed to open weekly note:", error);
			new Notice("Failed to open weekly note. Please check your settings.");
		}
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
		const dailyNotesPlugin = this.app.internalPlugins.plugins["daily-notes"];
		// @ts-ignore
		const periodicNotes = this.app.plugins.getPlugin("periodic-notes");

		if (!dailyNotesPlugin && !periodicNotes) {
			new Notice("Daily Note Navbar: Install Periodic Notes or Daily Notes");
			return false;
		}

		if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
			return true;
		} else if (periodicNotes && periodicNotes.settings?.daily?.enabled) {
			return true;
		}

		new Notice("Daily Note Navbar: Enable Periodic Notes or Daily Notes");
		return false;
	}

	hasWeeklyNotesDependencies(): boolean {
		// @ts-ignore
		const periodicNotes = this.app.plugins.getPlugin("periodic-notes");
		return periodicNotes?.settings?.weekly?.enabled ?? false;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

