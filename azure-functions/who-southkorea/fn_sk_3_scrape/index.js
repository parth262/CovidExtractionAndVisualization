const fetch = require("node-fetch")
const FormData = require("form-data")
const { JSDOM } = require("jsdom")
const { ContainerClient } = require("@azure/storage-blob")

module.exports = async function (context, myTimer) {
    var timestamp = new Date()

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

    //scrapping
    const htmlPage = await getPage(1)
    const dom = new JSDOM(htmlPage)
    const document = dom.window.document
    const firstPageData = extractTable(document)

    //gets other page links from pagination
    const pagination = document.querySelector(".pagination")
    const links = pagination.querySelectorAll("a")

    //scraps data from other pages
    const allPageData = await Promise.all(Array.from(links).slice(2, -2).map(async link => {
        const page = await getPage(+link.textContent)
        const htmlDom = new JSDOM(page)
        return extractTable(htmlDom.window.document)
    }))

    //combines all scrapped data
    const extractedData = firstPageData.concat(flatMap(allPageData))

    //groups into batches of 100 and translate all groups
    const grouped = groupInto(extractedData, 100)
    const translatedData = await Promise.all(grouped.map(translateTexts))

    //flattens grouped translated data and converts into csv
    const flattedTranslatedGroups = flatMap(translatedData)
    const header = "patient;personal_information;confirmation_date;institution\n"
    const finalCsv = header + flattedTranslatedGroups.join("\n")

    //save scrapped and translated data
    await uploadBlob("unprocessed", filename + ".csv", finalCsv)

    context.log("done")
};

function padLeft(v) {
    const strv = v.toString()
    return "0".repeat(2 - strv.length) + strv
}

async function getPage(pageIndex) {
    const formData = new FormData()
    formData.append("pageIndex", pageIndex)
    const response = await fetch(process.env["SOURCE_URL_DAEGU"], {
        method: "POST",
        body: formData
    })
    return response.text()
}

function extractTable(document) {
    const table = document.querySelector("#bbsList")
    const tbody = table.querySelector("tbody")
    const rows = tbody.querySelectorAll(".title_td")
    const data = Array.from(rows).map(row => {
        const cols = row.querySelectorAll("td")
        return Array.from(cols).map(col => col.textContent.trim()).join(";")
    })
    return data
}

function groupInto(arrData, groups) {
    const grouped = []
    let tempGroup = []
    arrData.forEach(d => {
        tempGroup.push(d)
        if (tempGroup.length === groups) {
            grouped.push(tempGroup)
            tempGroup = []
        }
    })
    grouped.push(tempGroup)
    return grouped
}

function flatMap(nestedArray) {
    return nestedArray.reduce((flatArray, d) => {
        return flatArray.concat(d)
    }, [])
}

async function translateTexts(texts) {
    const translateUrl = process.env["TranslatorURL"]
    const translateApiKey = process.env["TranslatorAPIKey"]
    const response = await fetch(translateUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": translateApiKey
        },
        body: JSON.stringify(texts.map(text => ({ text })))
    })
    const translated = await response.json()
    return translated.map(d => d["translations"][0]["text"])
}

async function uploadBlob(folder, blobName, data) {
    const containerName = "kor-3"
    var containerClient = new ContainerClient(process.env["AZURE_STORAGE_CONNECTION_STRING"], containerName)
    var targetBlobPath = `${folder}/${blobName}`
    await containerClient.uploadBlockBlob(targetBlobPath, data, Buffer.byteLength(data))
}