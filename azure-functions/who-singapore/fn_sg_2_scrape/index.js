const fetch = require("node-fetch")
const axios = require("axios")
const moment = require("moment-timezone")
const { JSDOM } = require("jsdom");
const PDFParser = require("pdf2json");
const { ContainerClient } = require("@azure/storage-blob")

const connectionString = process.env["AZURE_STORAGE_CONNECTION_STRING"]
const titles = 'Case Number,Date of Confirmation,Onset date,Age (years),Gender,Nationality,Travel History,Exposure,Key Places Visited after Symptoms Onset,Links,Cluster\n'

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    await fetchAndProcess(context)
    context.log("done")
}

async function fetchData(siteUrl) {
    const result = await axios.get(siteUrl);
    return new JSDOM(result.data).window.document;
};

function getDateString(elt) {
    if (elt.tagName === "BODY") {
        return null
    }
    if (elt.tagName === "TR") {
        return elt.firstChild.textContent.trim()
    }
    return getDateString(elt.parentNode)
}

async function fetchAndProcess(context) {
    const doc1 = await fetchData("https://www.moh.gov.sg/covid-19/past-updates")

    const a = doc1.getElementsByTagName('a');
    const baseUrl = 'https://www.moh.gov.sg/';
    for (let i = 0; i < a.length; i++) {
        if (a[i].textContent.match(/case/i)) {
            let u = a[i].href;
            const dateString = getDateString(a[i])
            if (!dateString) {
                continue
            }
            if (!u.match(/^(http|www)/i)) {
                u = baseUrl + u.replace(/www-moh-gov-sg-admin.cwp.sg|www.moh.gov.sg/, '').replace(/^(\/+|http(s)?[:/]+)/, '');
            }
            if (u.match(/\.pdf/i)) {
                try {
                    await parsePDF(u, dateString);
                } catch (err) {
                    // context.log("error", err.message)
                }
                continue;
            }
            try {
                const doc = await fetchData(u);
                const a1 = doc.getElementsByTagName('a');
                for (let j = 0; j < a1.length; j++) {
                    if (a1[j].href.match(/\.pdf/i)) {
                        let url = a1[j].href;
                        if (url.match(/^(www|http)/i)) {
                            url = baseUrl + url.replace(/www-moh-gov-sg-admin.cwp.sg|www.moh.gov.sg/, '').replace(/^(\/|http(s)?[:/]+)/, '');
                        }
                        try {
                            await parsePDF(url, dateString);
                        } catch (err) {
                            // context.log("error", err.message)
                        }
                    }
                }
            } catch (err) {
                // context.log("error", err.message)
            }
        }
    }

}

function padLeft(v, anchorElt) {
    const strv = v.toString()
    return "0".repeat(2 - strv.length) + strv
}

async function parsePDF(url, dateString) {

    const d = new Date()
    const filename = d.getFullYear() +
        padLeft(d.getMonth() + 1) +
        padLeft(d.getDate()) +
        padLeft(d.getHours()) +
        padLeft(d.getMinutes()) +
        padLeft(d.getSeconds()) +
        d.getMilliseconds()

    let pdfUrl = url
    if (pdfUrl.includes('?')) pdfUrl = pdfUrl.substr(0, pdfUrl.lastIndexOf('?'));

    pdfUrl = pdfUrl.replace('www-moh-gov-sg-admin.cwp', 'www.moh.gov');
    const response = await fetch(pdfUrl)
    const buffer = await response.arrayBuffer()

    const pdf = await getPDF(buffer)

    if (pdf && pdf.formImage.Pages.length > 0) {
        //scrap data
        const sourceUpdateDate = moment.utc(dateString, "DD MMM YYYY").toDate().getTime()
        const txt = await pdfParserCallback(pdf, sourceUpdateDate)
        if (txt.length > 10) {
            //save original data
            await uploadBlob("raw_data", filename + ".pdf", buffer)

            //save scrapped data
            await uploadBlob("unprocessed", filename + ".csv", txt);
        }
    }
}

async function getPDF(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser()
        pdfParser.on("pdfParser_dataReady", resolve)
        pdfParser.on("pdfParser_dataError", err => reject(err.parseError))
        pdfParser.parseBuffer(buffer)
    })
}

async function getPage(page, sourceUpdateDate) {
    const fills = page.Fills;
    const lineWidth = 0.05,
        shift = 0.16;
    let col = [];
    let row = [];

    let colPosX = [],
        ts = [],
        i = 1,
        i1 = 0,
        prevX = -1;
    for (; i < fills.length; i++) {
        if (fills[i].w > lineWidth) continue;
        let x = fills[i].x;
        if (x < prevX) {
            i1 = 0;
            break;
        }
        x = x - shift;
        const y = fills[i].y - shift;
        const y1 = y + fills[i].h;
        let txt = '';
        for (let j = 0; j < page.Texts.length; j++) {
            const t = page.Texts[j];
            if (t.y > y && t.y < y1 && t.x > prevX && t.x < x) {
                const R = t.R;
                for (let k = 0; k < R.length; k++)
                    txt = txt + R[k].T;
            } else if (t.y > y1 + 2 * shift) break;
        }
        const colName = decodeURIComponent(txt).replace(/,/g, '|').trim()
        if (colName)
            ts.push(colName);
        colPosX[i1++] = x + shift;
        prevX = x;
    }

    ts = ts.join(',').replace(/ /g, '').toLowerCase() + ' ';
    const ts1 = titles.replace(/[\s\n]/g, '').toLowerCase().split(',');
    const missingCols = [];

    for (let z = 0; z < ts1.length; z++) {
        if (!ts.includes(ts1[z])) {
            missingCols.push(z);
        }
    }

    if (missingCols.length > 3 || ts.split(",").length > ts1.length - missingCols.length) return '';

    let posX = [];
    for (; i < fills.length; i++) {
        if (fills[i].w > lineWidth) continue;
        let x = fills[i].x;
        if (x < prevX) {
            i1 = 0;
            prevX = x;
            if (col.length < 2) {
                col = [];
                posX = [];
                posX[i1] = x;
                i1++;
                continue;
            }
            if (col.length != 10 - missingCols.length) {
                const tempCol = [];
                let k1 = 0,
                    k2 = 0;
                while (k1 < posX.length - 1 && k2 < colPosX.length - 1) {
                    if (posX[k1] <= colPosX[k2] + shift) {
                        tempCol.push(col[k1]);
                        k1++;
                        k2++;
                    } else {
                        tempCol.push(' ');
                        k2++;
                    }
                }
                col = tempCol;
            }

            for (let k1 = 0; k1 < missingCols.length; k1++) {
                col.splice(missingCols[k1], 0, ' ');
            }

            if (col.length === titles.split(",").length) {
                row.push(col);
            }
            col = [];
            posX = [];
            posX[i1] = x;
            i1++;
            continue;
        }
        posX[i1] = x;
        x = x - shift;
        const y = fills[i].y - shift;
        const y1 = y + fills[i].h;

        let txt = '';
        for (let j = 0; j < page.Texts.length; j++) {
            const t = page.Texts[j];
            if (t.y > y && t.y < y1 && t.x > prevX && t.x < x) {
                const R = t.R;
                for (let k = 0; k < R.length; k++)
                    txt = txt + R[k].T;
            } else if (t.y > y1 + 2 * shift) break;
        }
        col.push(decodeURIComponent(txt).replace(/,/g, '|'));
        prevX = x;
        i1++;
    }

    if (col.length > 0 && col.length === titles.split(",").length) {
        for (let k1 = 0; k1 < missingCols.length; k1++) {
            col.splice(missingCols[k1], 0, ' - ');
        }
        row.push(col);
    }

    txt = '';

    for (let i = 0; i < row.length; i++) {
        if (row[i].join('').trim().length > 0)
            txt = txt + row[i].concat(sourceUpdateDate).join(' , ') + '\n';
    }

    return txt;
}

async function pdfParserCallback(data, sourceUpdateDate) {
    let txt = '';
    for (let i = 0; i < data.formImage.Pages.length; i++) {
        let tp1 = await getPage(data.formImage.Pages[i], sourceUpdateDate);
        if (tp1.trim().startsWith(',')) {
            let j = txt.length - 2;
            while (j >= 0 && txt[j] != '\n') j--;
            const j1 = tp1.indexOf('\n');
            let tp = tp1.substring(0, j1);
            tp1 = tp1.substring(j1);
            const t = txt.substring(j + 1).replace(/\n/g, '');
            const ts = tp.split(',');
            const ts1 = t.split(',');
            for (let k = 0; k < ts.length - 1 && k < ts1.length - 1; k++) {
                ts1[k] = ts1[k] + ts[k];
            }
            txt = txt.substring(0, j + 1) + ts1.join(', ') + tp1;
        } else
            txt = txt + tp1;
    }

    txt = txt.trim();
    return txt.length == 0 ? '' : titles.replace("\n", ",source_update_date\n") + txt;
}

async function uploadBlob(folder, blobName, data) {
    const containerName = "sg-2"
    const containerClient = new ContainerClient(connectionString, containerName)
    const targetBlobPath = `${folder}/${blobName}`
    await containerClient.uploadBlockBlob(targetBlobPath, data, Buffer.byteLength(data))
}