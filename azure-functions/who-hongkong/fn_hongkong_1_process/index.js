const csv = require("csvtojson")
const moment = require('moment-timezone')
const { moveBlob, getRawDataUrl } = require('./blobHelperFunctions')
const { upsertAll, insertToValidate, log } = require('./sqlHelperFunctions')

moment.tz.setDefault("UTC")

const fieldMappings = {
    'caseno.': "case_id_national",
    'reportdate': "report_date",
    'dateofonset': "symptom_onset_date",
    'gender': "sex",
    'age': "age_in_years",
    'nameofhospitaladmitted': "hospitalization_location",
    'hospitalised/discharged/deceased': "status_final",
    'hk/non-hkresident': "residency_status",
    'caseclassification*': "exposure_history",
    "source_update_date": "datetime_of_update_by_source_latest_extraction"
}

const caseClassificationMapping = {
    "I": "Imported case",
    "PL": "Possibly local case",
    "L": "Local case",
    "Epi-I": "Epidemiologically linked with imported case",
    "Epi-PL": "Epidemiologically linked with possibly local case",
    "Epi-L": "Epidemiologically linked with local case"
}

const fields = [
    "case_id_national",
    "report_date",
    "symptom_onset_date",
    "sex",
    "age_in_years",
    "hospitalization_location",
    "status_final",
    "residency_status",
    "exposure_history",
    "exposure_history_known",
    "symptoms_present_at_presentation_testing",
    "datetime_of_update_by_source_latest_extraction"
]

const country = "HKG"
const countryName = "Hong Kong"
const format = "HKG_1"
const digitRegex = /[-+]?\d+/
const currentTime = moment().toDate()
const sexCategories = ["m", "f"]

module.exports = async function (context, myBlob) {
    const rawDataUrl = getRawDataUrl(context.bindingData.blobTrigger)
    const data = await csv().fromString(myBlob.toString())
    const mappedData = mapDataWithNewKey(data, process.env["SOURCE_URL"], rawDataUrl)
    const [validated, toValidate] = mappedData.reduce((grouped, d) => {
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
    if (validated.length > 0) {
        context.log("Upserting Validated Data", validated.length)
        await upsertAll(validated)
    }

    // insert invalidated data
    if (toValidate.length > 0) {
        context.log("Inserting Data To Be Validated", toValidate.length)
        await insertToValidate(toValidate)
    }

    // move blob to processed folder
    context.log("Moving blob")
    const targetBlobPath = await moveBlob(context, myBlob)

    // log to table
    context.log("Logging Into The Log Table")
    await log(countryName, format, moment().format("YYYY-MM-DD HH:mm:ss"), rawDataUrl, validated.length, toValidate.length)
    context.log("Done")
};

function mapDataWithNewKey(data, sourceUrl, rawDataUrl) {

    return data.map(d => {
        const new_d = transformData(d)
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

function transformData(d) {
    const new_d = {}
    Object.keys(d).forEach(key => {
        const value = d[key] && d[key].toString().trim() !== "null" ? d[key].toString().trim() : null
        switch (key) {
            case "dateofonset":
                if (value && value.toLowerCase() === "asymptomatic") {
                    new_d["symptoms_present_at_presentation_testing"] = false
                    break
                }
                const dateValue = value && moment.utc(value, "DD/MM/YYYY").tz("Asia/Hong_Kong").toDate()
                if (dateValue && !isNaN(dateValue.getTime())) {
                    new_d["symptoms_present_at_presentation_testing"] = true
                    new_d[fieldMappings[key]] = dateValue
                }
                break
            case "reportdate":
                const dateValue = value && moment.utc(value, "DD/MM/YYYY").tz("Asia/Hong_Kong").toDate()
                if (dateValue && !isNaN(dateValue.getTime())) {
                    new_d[fieldMappings[key]] = dateValue
                }
                break
            case "caseclassification*":
                new_d["exposure_history_known"] = !!value
                new_d[fieldMappings[key]] = value && caseClassificationMapping[value]
                break
            case "age":
                const extractedDigit = digitRegex.exec(value)
                if (extractedDigit) {
                    new_d[fieldMappings[key]] = Number(extractedDigit[0])
                }
                break
            case "source_update_date":
                new_d[fieldMappings[key]] = value && new Date(+value)
                break
            default:
                if (fieldMappings[key]) {
                    new_d[fieldMappings[key]] = d[key]
                }
        }
    })
    fields.forEach(field => {
        if (!new_d.hasOwnProperty(field)) {
            new_d[field] = null
        }
    })
    return new_d
}

function validate(d) {
    const ageNumber = d["age_in_years"]
    return (d["sex"] ? sexCategories.some(c => c === d["sex"].toLowerCase()) : true) &&
        (ageNumber ? ageNumber < 105 && ageNumber >= 0 : true)
}