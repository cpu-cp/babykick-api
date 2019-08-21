/**
 *  BUILD 
 *  for build a count summary image
 *  parameter is a json form
 *  json > html > pdf > jpg
 *  developing ...
 * 
 *  Created by CPU on 19/8/19
 */

const puppeteer = require('puppeteer');
const fsOld = require('fs');
const fs = require('fs-extra');
const hbs = require('handlebars');
const path = require('path');
const pdf = require('pdf-poppler');
const moment = require('moment');

async function buildImage (data) {

    const compile = async function (templateName, data) {
        const filePath = await path.join(process.cwd(), 'templates', `${templateName}.hbs`);
        const html = await fs.readFile(filePath, 'utf-8');
        return await hbs.compile(html)(data);
    };

    hbs.registerHelper('dateFormat', function (value, format) {
        return moment(value).format(format);
    });

    (async function () {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            const content = await compile('shot-list', data);

            await page.setContent(content);
            await page.emulateMedia('screen');
            let height = await page.evaluate(() => document.documentElement.offsetHeight);
            await page.pdf({
                path: 'uploads/week/' + data.message + '.pdf',
                height: height + 'px',
                width: '10cm',
                printBackground: true,
                pageRanges: '1'
            });


            let file = await 'uploads/week/' + data.message + '.pdf';
            let fileout = 'uploads/week/' + data.message;

            let opts = {
                format: 'jpeg',
                out_dir: path.dirname(file),
                out_prefix: path.basename(fileout, path.extname(file)),
            }

            await pdf.convert(file, opts)
                .then(res => {
                    console.log('Successfully converted');
                    fsOld.unlink(file, function() {
                        console.log('Remove pdf file');
                    })
                })
                .catch(error => {
                    console.error(error);
                })

            console.log('done');
            await browser.close();

        } catch (e) {
            console.log('our error', e);
        }
    })();
}
module.exports.buildImage = buildImage;