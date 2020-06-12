const path = require("path")
const axios = require("axios");
const { ContainerClient } = require('@azure/storage-blob');
const { parse } = require("json2csv")

const connectionString = process.env["AZURE_STORAGE_CONNECTION_STRING"]
const sourceUrl = process.env["SOURCE_URL"]
const fields = ['Date', 'No', 'Accumulation', 'Sum_', 'Prefecture', 'Age', 'Gender', 'SumByStatus', 'SumOf2weeks', 'X', 'Y', 'ObjectId', 'Code', 'Status'];

module.exports = async function (context, myTimer) {
    const timestamp = new Date();

    if (myTimer.isPastDue) {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!' + timestamp.toISOString());

    const filename = timestamp.getFullYear() +
        padLeft(timestamp.getMonth() + 1) + // getMonth returns zero based month integer
        padLeft(timestamp.getDate()) +
        padLeft(timestamp.getHours()) +
        padLeft(timestamp.getMinutes()) +
        padLeft(timestamp.getSeconds())

    const result = await axios.get(sourceUrl);

    //save original data
    await writeBlob("raw_data", filename + ".json", JSON.stringify(result.data))

    //scrapping logic
    const processedData = scrap(result.data)

    //save scrapped data
    await writeBlob("unprocessed", filename + ".csv", parse(processedData));
    context.log("Done")
}

function padLeft(v) {
    const strv = v.toString()
    return "0".repeat(2 - strv.length) + strv
}

async function writeBlob(folder, blobName, data) {
    const containerClient = new ContainerClient(connectionString, "jpn-1")
    const { blockBlobClient } = await containerClient.uploadBlockBlob(path.join(folder, blobName), data, Buffer.byteLength(data))
    return decodeURIComponent(blockBlobClient.url)
}

function scrap(data) {
    return data.features.map(item => {
        const new_d = {}
        const d = item["attributes"]
        fields.forEach(field => {
            new_d[field] = d[field]
        })
        new_d["source_update_date"] = null
        return new_d
    })
}