import { test as base, expect } from "../../packages/app/e2e/support/fixtures";
import { _electron as electron } from "@playwright/test";
import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
import path from "node:path";
export { expect };
export const test = base.extend({
  page: async ({ e2eWorker, baseURL }, use, testInfo) => {
    const profile = await mkdtemp(path.join(process.cwd(), ".tmp/fork-electron-profile-"));
    // Avoid downloading optional React DevTools into every isolated test profile.
    await mkdir(path.join(profile, "extensions/fmkadmapgofadopljbjfkapdkoienihi"), {recursive:true});
    await writeFile(path.join(profile, "desktop-settings.json"), JSON.stringify({daemon:{manageBuiltInDaemon:false,keepRunningAfterQuit:true}}));
    const env = {...process.env, EXPO_DEV_URL: baseURL!, PASEO_ELECTRON_USER_DATA_DIR: profile,
      PASEO_HOME: process.env.E2E_PASEO_HOME!, PASEO_DAEMON_ENDPOINT: `127.0.0.1:${process.env.E2E_DAEMON_PORT}`,
      PASEO_TEST_APP_NAME:"Paseo Fork QA", PASEO_DISABLE_SINGLE_INSTANCE_LOCK:"1"};
    delete env.ELECTRON_RUN_AS_NODE;
    const app = await electron.launch({locale:"en-US",args:[path.join(process.cwd(), "packages/desktop")], env,
      recordVideo:{dir:testInfo.outputPath("video")}, timeout:30000});
    app.process().stderr?.on("data", (data) => process.stderr.write(data));
    app.process().stdout?.on("data", (data) => process.stdout.write(data));
    console.log("Electron startup", await app.evaluate(({app,BrowserWindow})=>({ready:app.isReady(), windows:BrowserWindow.getAllWindows().length, argv:process.argv})));
    try {
      const page = await app.firstWindow();
      await page.waitForURL((url) => url.origin === new URL(baseURL!).origin, {waitUntil:"domcontentloaded"});
      await page.waitForLoadState("networkidle");
      const goto = page.goto.bind(page);
      page.goto = (url, options) => goto(new URL(url, baseURL).toString(), options);
      await page.setViewportSize({width:1280,height:720});
      await use(page);
    } finally { await app.close(); await rm(profile,{recursive:true,force:true}); }
  }
});
