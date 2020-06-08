var { ContainerClient } = require('@azure/storage-blob')

var connectionString = process.env["AZURE_STORAGE_CONNECTION_STRING"]
var containerName = "hkg-1"
var targetFolderName = "processed"
var sourceFolderName = "unprocessed"

module.exports = {
    moveBlob: async function (context, buffer) {
        var blobName = context.bindingData.name
        var containerClient = new ContainerClient(connectionString, containerName)
        var sourceBlobPath = `${sourceFolderName}/${blobName}`
        var targetBlobPath = `${targetFolderName}/${blobName}`
        await containerClient.uploadBlockBlob(targetBlobPath, buffer, buffer.length)
        context.log(blobName, "uploaded to", targetFolderName)
        await containerClient.deleteBlob(sourceBlobPath, { deleteSnapshots: 'include' })
        context.log(blobName, "deleted from", sourceFolderName)
        return `${containerName}/${targetFolderName}`
    },
    getRawDataUrl: function (blobPath) {
        const splitString = connectionString.split(";")
        const storageName = splitString.find(str => str.startsWith("AccountName")).split("=")[1]
        return `https://${storageName}.blob.core.windows.net/${blobPath.replace(sourceFolderName, targetFolderName)}`
    }
}