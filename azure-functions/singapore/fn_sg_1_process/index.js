var csv = require('csvtojson')
var moment = require('moment-timezone')
var { moveBlob, getRawDataUrl } = require('./blobHelperFunctions')
var { upsertAll, insertToValidate, log } = require('./sqlHelperFunctions')

moment.tz.setDefault("UTC")

const fieldMappings = {
    'Case Number': 'case_id_national',
    'Age (Years)': 'age_in_years',
    'Gender': 'sex',
    "source_update_date": "datetime_of_update_by_source_latest_extraction"
}

const fields = [
    'case_id_national',
    'test_result_confirmation_date',
    'hospitalization_location',
    'age_in_years',
    'sex',
    'citizenship_nationality_country',
    'residency_status',
    'travel_history_international',
    'travel_history_1_country',
    'exposure_history',
    'datetime_of_update_by_source_latest_extraction',
    'exposure_history_links',
    'exposure_history_cluster'
]

const country = "SGP"
const countryName = "Singapore"
const format = "SG_1"
var currentTime = moment().toDate()

var digitRegex = /[-+]?\d+/

function transformData(d) {
    new_d = {}
    Object.keys(d).forEach(key => {
        const value = d[key] && d[key].toString().trim() !== "null" ? d[key].toString().trim() : null
        switch (key) {
            case 'Age (Years)':
                new_d["age_in_years"] = !isNaN(value) ? Number(value) : null
                break
            case "Date of Confirmation":
                const confirmationDate = value ? moment.utc(value, "DD MMMM").toDate() : null
                if(confirmationDate && !isNaN(confirmationDate.getTime())) {
                    new_d["test_result_confirmation_date"] = confirmationDate
                }
                break
            case "Nationality":
                let country = value
                let status = value
                if (value && value.toLowerCase() !== "pending") {
                    const firstBracketIndex = value.indexOf("(")
                    const lastBracketIndex = value.indexOf(")")
                    country = value.substring(0, firstBracketIndex)
                    status = value.substring(firstBracketIndex + 1, lastBracketIndex)
                }
                new_d["citizenship_nationality_country"] = country
                new_d["residency_status"] = status
                break
            case "Travel History":
                new_d["travel_history_international"] = +(!!value && value !== "-")
                new_d["travel_history_1_country"] = value && value.replace(/\|/g, ",")
                break
            case 'Links':
                new_d["exposure_history_links"] = value && value.replace(/\|/g, ",")
                break
            case 'Cluster':
                new_d["exposure_history_cluster"] = value && value.replace(/\|/g, ",")
                break
            case 'Exposure':
                new_d["exposure_history"] = value && value.replace(/\|/g, ",")
                break
            case 'Hospital admitted':
                new_d["hospitalization_location"] = value && value.replace(/\d+$/, "")
                break
            case "source_update_date":
                new_d[fieldMappings[key]] = value && new Date(+value)
                break
            default:
                new_d[fieldMappings[key]] = d[key]
        }
    })
    fields.forEach(field => {
        if (!new_d.hasOwnProperty(field)) {
            new_d[field] = null
        }
    })
    return new_d
}

var sexCategories = ["m", "f", "pending"]

function validate(d) {
    const ageNumber = d["age_in_years"]
    return (d["sex"] ? sexCategories.some(c => c === d["sex"].toLowerCase().trim()) : true) &&
        (ageNumber ? ageNumber < 105 && ageNumber >= 0 : true)
}

function mapDataWithNewKey(data, sourceUrl, rawDataUrl) {

    return data.map(d => {
        var new_d = transformData(d)
        new_d["valid"] = validate(new_d)
        new_d["datetime_of_intial_extraction"] = currentTime
        new_d["source_url"] = sourceUrl
        new_d["raw_data"] = rawDataUrl
        new_d["source_country"] = country
        new_d["source_country_name"] = countryName
        new_d["format"] = format
        return new_d
    })
}

module.exports = async function (context, myBlob) {
    context.log("JavaScript blob trigger function processed blob \n Blob:", context.bindingData.blobTrigger, "\n Blob Size:", myBlob.length, "Bytes");
    try {
        var rawDataUrl = getRawDataUrl(context.bindingData.blobTrigger)
        var data = await csv().fromString(myBlob.toString())
        var mappedData = mapDataWithNewKey(data, process.env["SOURCE_URL"], rawDataUrl)
        var [validated, toValidate] = mappedData.reduce((grouped, d) => {
            if (d.valid) {
                grouped[0].push(d)
            } else {
                grouped[1].push({
                    validation_status: "Unvalidated",
                    timestamp: currentTime,
                    country,
                    datetime_of_latest_extraction: currentTime,
                    ...d
                })
            }
            return grouped
        }, [[], []])

        // upsert validated data
        context.log("Upserting Validated Data", validated.length)
        if (validated.length > 0)
            await upsertAll(validated)

        // insert invalidated data
        context.log("Inserting Data To Be Validated", toValidate.length)
        if (toValidate.length > 0)
            await insertToValidate(toValidate)

        // move blob to processed folder
        context.log("Moving blob")
        var targetBlobPath = await moveBlob(context, myBlob)

        // log to table
        context.log("Logging Into The Log Table")
        await log(moment().format("YYYY-MM-DD HH:mm:ss"), countryName, format, rawDataUrl, validated.length, toValidate.length)
        context.log("Done")
    } catch (err) {
        context.log.error('Error', err)
        throw err
    }
};