import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import { CheerioCrawler, downloadListOfUrls } from 'crawlee';
import path from "path";
import fse from "fs-extra";
import url from 'url';
const { URL } = process.env;

const publicDir = path.join(__dirname, "../public");
fse.removeSync(publicDir);
fse.ensureDirSync(publicDir);

async function main() {
    const crawler = new CheerioCrawler({
        // Function called for each URL
        async requestHandler(i) {
            // @ts-ignore
            let content = i.body.replace(`<div id="__framer-badge-container"></div>`, "");
            let routeName = url.parse(i.request.url).pathname;
            if (routeName === "/") {
                routeName = "index";
            }
            routeName += ".html";
            fse.outputFileSync(path.join(publicDir, routeName), content, "utf8");
        },
        maxRequestsPerCrawl: 10 // Limitation for only 10 requests (do not use if you want to crawl a sitemap)
    });

    const listOfUrls = await downloadListOfUrls({ url: URL });

    await crawler.addRequests(listOfUrls);
    await crawler.run();
}

main().then(console.log).catch(console.error);
