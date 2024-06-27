import { PaneType } from "obsidian";
import { FileOpenType } from "../types";

export const FILE_OPEN_TYPES_TO_PANE_TYPE: Record<PaneType, FileOpenType> = {
	"window": "New window",
	"tab": "New tab",
	"split": "Split right"
}

type FileOpenTypeMapping = Record<Exclude<FileOpenType, "Active">, {icon: string, title: string}>;
export const FILE_OPEN_TYPES_MAPPING: FileOpenTypeMapping = {
	"New tab": {
		icon: "file-plus",
		title: "Open in new tab"
	},
	"Split right": {
		icon: "separator-vertical",
		title: "Split right"
	},
	"Split down": {
		icon: "separator-vertical",
		title: "Split down"
	},
	"New window": {
		icon: "picture-in-picture-2",
		title: "Open in new window"
	}
};
