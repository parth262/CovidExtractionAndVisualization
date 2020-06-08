var csv = require('csvtojson')
var moment = require('moment-timezone')
var { moveBlob, getRawDataUrl } = require('./blobHelperFunctions')
var { upsertAll, insertToValidate, log } = require('./sqlHelperFunctions')

moment.tz.setDefault("UTC")

const fieldMappings = {
    'Case Number': 'case_id_national',
    'Age (years)': 'age_in_years',
    'Gender': 'sex',
    'Nationality': 'citizenship_nationality_country',
    'Travel History': 'travel_history_1_country',
    'Exposure': 'exposure_history',
    'Links': 'exposure_history_links',
    'Cluster': 'exposure_history_cluster',
    'Key Places Visited after Symptoms Onset': 'exposure_history_post_onset',
    'Onset date': 'symptom_onset_date',
    'Date of Confirmation': 'test_result_confirmation_date',
    'source_update_date': 'datetime_of_update_by_source_latest_extraction'
}

const fields = [
    'case_id_national',
    'test_result_confirmation_date',
    'age_in_years',
    'sex',
    'citizenship_nationality_country',
    'travel_history_1_country',
    'exposure_history',
    'exposure_history_links',
    'exposure_history_cluster',
    'exposure_history_post_onset',
    'linked_to_cluster_exposure_to_known_case',
    'symptom_onset_date',
    'symptoms_present_at_presentation_testing',
    'datetime_of_update_by_source_latest_extraction',
]

const country = "SGP"
const countryName = "Singapore"
const format = "SG_2"
var currentTime = moment().toDate()

var digitRegex = /[-+]?\d+/

function transformData(d) {
    new_d = {}
    Object.keys(d).forEach(key => {
        const value = d[key] && d[key].toString().trim() !== "null" ? d[key].toString().trim() : null
        switch (key) {
            case 'Age (years)':
                new_d[fieldMappings[key]] = !isNaN(value) ? +value : null
                break
            case "Onset date":
                if (value && value.toLowerCase() === "asymptomatic") {
                    new_d["symptoms_present_at_presentation_testing"] = false
                    break
                }
                const dateValue = value && moment.utc(value, "DD MMMM").toDate()
                if (dateValue && !isNaN(dateValue.getTime())) {
                    new_d["symptoms_present_at_presentation_testing"] = true
                    new_d[fieldMappings[key]] = dateValue
                }
                break
            case "Date of Confirmation":
                const dateValue = value && moment.utc(value, "DD MMMM").toDate()
                if (dateValue && !isNaN(dateValue.getTime())) {
                    new_d[fieldMappings[key]] = dateValue
                }
                break
            case "Travel History":
                new_d[fieldMappings[key]] = value && value.replace(/\|/g, ",")
                break
            case 'Links':
                new_d[fieldMappings[key]] = value && value.replace(/\|/g, ",")
                break
            case 'Cluster':
                new_d[fieldMappings[key]] = value && value.replace(/\|/g, ",")
                break
            case 'Exposure':
                new_d[fieldMappings[key]] = value && value.replace(/\|/g, ",")
                break
            case "source_update_date":
                new_d[fieldMappings[key]] = value && new Date(+value)
                break
            default:
                new_d[fieldMappings[key]] = value
        }
    })
    new_d["linked_to_cluster_exposure_to_known_case"] = !!(new_d["exposure_history"] || new_d["exposure_history_links"])
    fields.forEach(field => {
        if (!new_d.hasOwnProperty(field)) {
            new_d[field] = null
        }
    })
    return new_d
}

var sexCategories = ["m", "f"]

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