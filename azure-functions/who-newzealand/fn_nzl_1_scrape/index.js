const fetch = require("node-fetch")
const cheerio = require("cheerio")
const moment = require("moment-timezone")
const excelToJson = require("convert-excel-to-json")
const { parse } = require("json2csv")
const { ContainerClient } = require("@azure/storage-blob")

const connectionString = process.env["AZURE_STORAGE_CONNECTION_STRING"]
const sourceUrl = process.env["SOURCE_URL"]

const dateRegex = /\d{1,2}\s*[A-Za-z]{3,10}\s*\d{4}/
const timeRegex = /\d{1,2}\.\d{2}\s*(a|p)m/
const offsetMilliseconds = (moment().utcOffset() * 60 + 10) * 1000
const columnHeaderMapping = {
    A: "Date of report",
    B: "Sex",
    C: "Age group",
    D: "DHB",
    E: "Overseas Travel",
    F: "Last country before return",
    G: "Flight number",
    H: "Flight departure date",
    I: "Arrival date"
}

module.exports = async function (context, myTimer) {
    const timestamp = new Date()

    if (myTimer.IsPastDue) {
        context.log('JavaScript is running late!')
    }
    context.log('JavaScript timer trigger function ran!', timestamp.toISOString())

    const filename = timestamp.getFullYear() +
        padLeft(timestamp.getMonth() + 1) +
        padLeft(timestamp.getDate()) +
        padLeft(timestamp.getHours()) +
        padLeft(timestamp.getMinutes()) +
        padLeft(timestamp.getSeconds())

    //get data
    const response = await fetch(sourceUrl)
    const htmlPage = await response.text()
    const $ = cheerio.load(htmlPage)
    const mainSection = $(".field-item.even").first()
    const excelData = await getExcelData(mainSection)
    const sourceUpdateDate = getSourceUpdateDate(mainSection)

    //save original data
    await uploadBlob("raw_data", filename + ".xlsx", excelData)

    //scrap
    const csv = scrap(excelData, sourceUpdateDate)

    //save scrapped data
    await uploadBlob("unprocessed", filename + ".csv", csv)

    context.log("done")
};

function padLeft(v) {
    const strv = v.toString()
    return "0".repeat(2 - strv.length) + strv
}

async function getExcelData(mainSection) {
    const h2 = mainSection.find("#download").parent()
    const link = h2.next().find("a").first().attr().href
    const linkRes = await fetch(`https://www.health.govt.nz${link}`)
    return linkRes.arrayBuffer()
}

function getSourceUpdateDate(mainSection) {
    const updateInfo = mainSection.find(".georgia-italic").text()
    const normalizedText = decodeURIComponent(encodeURIComponent(updateInfo).replace(/%C2%A0/g, "%20"))
    const date = dateRegex.exec(normalizedText)
    const time = timeRegex.exec(normalizedText)
    const dateTime = date[0] + " " + time[0]
    return moment.utc(dateTime, "DD MMM YYYY hh.mm a").toDate().getTime()
}

function scrap(data, sourceUpdateDate) {
    const jsonData = excelToJson({
        source: Buffer.from(data),
        header: {
            rows: 4
        },
        columnToKey: columnHeaderMapping
    })

    const allData = jsonData["Confirmed"].concat(jsonData["Probable"])

    const transformer = (item) => {
        const processedItem = { ...item }
        const flightDepartureDate = processedItem["Flight departure date"]
        const arrivalDate = processedItem["Arrival date"]
        if (flightDepartureDate) {
            processedItem["Flight departure date"] = flightDepartureDate.getTime() + offsetMilliseconds
        }
        if (arrivalDate) {
            processedItem["Arrival date"] = arrivalDate.getTime() + offsetMilliseconds
        }
        return {
            ...processedItem,
            "source_update_date": sourceUpdateDate
        }
    }

    return parse(allData, {
        transforms: [transformer],
        fields: Object.values(columnHeaderMapping).concat("source_update_date")
    })
}

async function uploadBlob(folder, blobName, data) {
    const containerName = "nzl-1"
    const containerClient = new ContainerClient(connectionString, containerName)
    const targetBlobPath = `${folder}/${blobName}`
    await containerClient.uploadBlockBlob(targetBlobPath, data, Buffer.byteLength(data))
}