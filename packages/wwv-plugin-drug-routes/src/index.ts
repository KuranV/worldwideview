/**
 * @file index.ts
 * @description Bundle entry for the Drug Trafficking Routes plugin. The host loader
 * (`loadPluginFromManifest`) instantiates the default export, so it must be the
 * WorldPlugin class. Named exports are provided for tests and direct host imports.
 */

import { DrugRoutesPlugin } from "./DrugRoutesPlugin";

export default DrugRoutesPlugin;
export { DrugRoutesPlugin };
export type { Substance } from "./types";
