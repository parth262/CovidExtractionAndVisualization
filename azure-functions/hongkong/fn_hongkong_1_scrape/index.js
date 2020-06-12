const fetch = require('node-fetch')
const { ContainerClient } = require('@azure/storage-blob')
const PDFParser = require('pdf2json')
const { parse } = require('json2csv')

const connectionString = process.env["AZURE_STORAGE_CONNECTION_STRING"]
const sourceUrl = process.env["SOURCE_URL"]

const titles = "caseno.,reportdate,dateofonset,gender,age,nameofhospitaladmitted,hospitalised/discharged/deceased,hk/non-hkresident,caseclassification*,confirmed/probable\n"

module.exports = async function (context, myTimer) {
    var timestamp = new Date();

    if (myTimer.IsPastDue) {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timestamp.toISOString());

    const filename = timestamp.getFullYear() +
        padLeft(timestamp.getMonth() + 1) +
        padLeft(timestamp.getDate()) +
        padLeft(timestamp.getHours()) +
        padLeft(timestamp.getMinutes()) +
        padLeft(timestamp.getSeconds())

    const response = await fetch(sourceUrl)
    const buffer = await response.arrayBuffer()

    //save original data
    await uploadBlob("raw_data", filename + ".pdf", buffer)

    //scrapping logic
    const data = await processBuffer(buffer)
    const epochDate = getDate(data.formImage.Pages[0])
    const csv = pdfParserCallback(data, epochDate)

    //save scrapped data
    await uploadBlob("unprocessed", filename + ".csv", csv)
};

function padLeft(v) {
    const strv = v.toString()
    return "0".repeat(2 - strv.length) + strv
}

async function processBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser()
        pdfParser.on("pdfParser_dataReady", resolve)
        pdfParser.on("pdfParser_dataError", err => reject(err.parseError))
        pdfParser.parseBuffer(buffer)
    })
}

function getDate(page) {
    const dateRegex = /\d{2}\s*[a-zA-Z]{3,10}\s*\d{4}/
    const dayRegex = /\d{2}/
    const monthRegex = /[a-zA-Z]{3,10}/
    const yearRegex = /\d{4}/
    let txt = ""
    let currentText = null
    let nextText = null
    let i = 0
    do {
        currentText = page.Texts[i]
        txt += currentText.R[0].T
        nextText = page.Texts[i + 1]
        i++
    } while (Math.abs(nextText.y - currentText.y) < 1)
    const dateString = dateRegex.exec(decodeURIComponent(txt))[0]
    const day = dayRegex.exec(dateString)[0]
    const month = monthRegex.exec(dateString)[0]
    const year = yearRegex.exec(dateString)[0]
    return new Date(`${day} ${month} ${year}`).getTime() + (330 * 60 * 1000)
}

function pdfParserCallback(data, epochDate) {
    var txt = '';
    const pageStartIndex = 6 //data.formImage.Pages.findIndex(page => page.Texts.some(text => text.R[0].T.includes(pageStartKeyText)))
    for (var i = pageStartIndex; i < data.formImage.Pages.length; i++) {
        var tp1 = getPage(data.formImage.Pages[i], epochDate);
        if (tp1.trim().startsWith(',')) {
            var j = txt.length - 2;
            while (j >= 0 && txt[j] != '\n') j--;
            var j1 = tp1.indexOf('\n');
            tp = tp1.substring(0, j1);
            tp1 = tp1.substring(j1);
            var t = txt.substring(j + 1).replace(/\n/g, '');
            var ts = tp.split(',');
            var ts1 = t.split(',');
            for (var k = 0; k < ts.length && k < ts1.length; k++) {
                ts1[k] = ts1[k] + ts[k];
            }
            txt = txt.substring(0, j + 1) + ts1.join(', ') + tp1;
        } else
            txt = txt + tp1;
    }

    txt = txt.trim();
    return txt.length == 0 ? '' : titles.replace("\n", ",source_update_date\n") + txt;
}

function getPage(page, epochDate) {
    var fills = page.Fills;
    var lineWidth = 0.05,
        shift = 0.16;
    var col = [];
    var row = [];

    var colPosX = [],
        ts = [],
        i = 1,
        i1 = 0,
        prevX = -1;
    for (; i < fills.length; i++) {
        if (fills[i].w > lineWidth) continue;
        var x = fills[i].x;
        if (x < prevX) {
            i1 = 0;
            break;
        }
        x = x - shift;
        var y = fills[i].y - shift;
        var y1 = y + fills[i].h;
        var txt = '';
        for (var j = 0; j < page.Texts.length; j++) {
            var t = page.Texts[j];
            if (t.y > y && t.y < y1 && t.x > prevX && t.x < x) {
                var R = t.R;
                for (var k = 0; k < R.length; k++)
                    txt = txt + R[k].T;
            } else if (t.y > y1 + 2 * shift) break;
        }
        ts.push(decodeURIComponent(txt).replace(/,/g, '|'));
        colPosX[i1++] = x + shift;
        prevX = x;
    }

    ts = ts.join(',').replace(/ /g, '').toLowerCase() + ' ';
    var ts1 = titles.replace(/[\s\n]/g, '').toLowerCase().split(',');
    var missingCols = [];

    for (var z = 0; z < ts1.length; z++) {
        if (!ts.includes(ts1[z])) {
            missingCols.push(z);
        }
    }

    if (missingCols.length > 3) return '';

    var posX = [];
    for (; i < fills.length; i++) {
        if (fills[i].w > lineWidth) continue;
        var x = fills[i].x;
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
                var tempCol = [];
                var k1 = 0,
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

            for (var k1 = 0; k1 < missingCols.length; k1++) {
                col.splice(missingCols[k1], 0, ' ');
            }

            row.push(col);
            col = [];
            posX = [];
            posX[i1] = x;
            i1++;
            continue;
        }
        posX[i1] = x;
        x = x - shift;
        var y = fills[i].y - shift;
        var y1 = y + fills[i].h;

        var txt = '';
        for (var j = 0; j < page.Texts.length; j++) {
            var t = page.Texts[j];
            if (t.y > y && t.y < y1 && t.x > prevX && t.x < x) {
                var R = t.R;
                for (var k = 0; k < R.length; k++)
                    txt = txt + R[k].T;
            } else if (t.y > y1 + 2 * shift) break;
        }
        col.push(decodeURIComponent(txt).replace(/,/g, '|'));
        prevX = x;
        i1++;
    }

    if (col.length > 0) {
        for (var k1 = 0; k1 < missingCols.length; k1++) {
            col.splice(missingCols[k1], 0, ' - ');
        }
        row.push(col);
    }

    txt = '';
    for (var i = 0; i < row.length; i++) {
        if (row[i].join('').trim().length > 0)
            txt = txt + row[i].concat(epochDate).join(' , ') + '\n';
    }
    return txt;
}

async function uploadBlob(folder, blobName, data) {
    const containerName = "hkg-1"
    var containerClient = new ContainerClient(connectionString, containerName)
    var targetBlobPath = `${folder}/${blobName}`
    await containerClient.uploadBlockBlob(targetBlobPath, data, Buffer.byteLength(data))
}