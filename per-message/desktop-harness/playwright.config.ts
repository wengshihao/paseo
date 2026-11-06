import { defineConfig } from "@playwright/test";
import base from "../../packages/app/playwright.config";
import path from "node:path";
export default defineConfig({...base,testDir:__dirname,testMatch:"smoke.spec.ts",globalSetup:path.resolve(__dirname,"../../packages/app/e2e/support/global-setup.ts"),outputDir:path.resolve(__dirname,"../../../per-message-desktop-results"),projects:[{name:"electron"}],workers:1});
