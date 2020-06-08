const csv = require('csvtojson')
const moment = require('moment-timezone')
const { moveBlob, getRawDataUrl } = require('./blobHelperFunctions')
const { upsertAll, insertToValidate, log } = require('./sqlHelperFunctions')

moment.tz.setDefault("UTC")

const country = "JPN"
const format = "JPN_1"
const countryName = "Japan"
const digitRegex = /[-+]?\d+/
const currentTime = moment().toDate()
const sexCategories = ["m", "f", "unknown"]

const fieldMappings = {
    "No": "case_id_national",
    "Age": "age_group",
    "Gender": "sex",
    "Prefecture": "residency_sub_national_1_name",
    "Code": "residency_sub_national_1_code",
    "Date": "test_result_confirmation_date",
    "source_update_date": "datetime_of_update_by_source_latest_extraction"
}

const fields = Object.values(fieldMappings)

function getGender(value) {
    if (value) {
        const gender = value.trim().toLowerCase()
        if (gender === "male") return "M"
        if (gender === "female") return "F"
        return gender
    }
    return value
}

function transformData(d) {
    const new_d = {}
    Object.keys(d).forEach(key => {
        const value = d[key] && d[key].toString().trim() !== "null" ? d[key] : null
        switch (key) {
            case "Gender":
                new_d[fieldMappings[key]] = getGender(value)
                break
            case "Code":
                if (value) {
                    const extractedDigit = digitRegex.exec(value)
                    if (extractedDigit) {
                        new_d[fieldMappings[key]] = extractedDigit[0]
                    } else {
                        new_d[fieldMappings[key]] = value
                    }
                }
                break
            case "Date":
                new_d[fieldMappings[key]] = value && moment(Number(value.trim())).tz("Asia/Tokyo").toDate()
                break
            case "source_update_date":
                new_d[fieldMappings[key]] = value && new Date(value)
                break
            default:
                if (fieldMappings[key]) {
                    new_d[fieldMappings[key]] = value
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
    const ageNumber = digitRegex.exec(d["age_group"])
    return (d["sex"] ? sexCategories.some(c => c === d["sex"].trim().toLowerCase()) : true) &&
        (ageNumber ? Number(ageNumber[0]) < 105 && Number(ageNumber[0]) >= 0 : true)
}

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

module.exports = async function (context, myBlob) {
    // context.log("JavaScript blob trigger function processed blob \n Blob:", context.bindingData.blobTrigger, "\n Blob Size:", myBlob.length, "Bytes");
    try {
        const rawDataUrl = getRawDataUrl(context.bindingData.blobTrigger)
        const data = await csv().fromString(myBlob.toString())
        const mappedData = mapDataWithNewKey(data, process.env["SOURCE_URL"], rawDataUrl)

        const [validated, toValidate] = mappedData.reduce((grouped, d) => {
            if (d.valid) {
                grouped[0].push(d)
            } else {
                grouped[1].push({
                    validation_status: "Unvalidated",
                    country,
                    timestamp: currentTime,
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
        const targetBlobPath = await moveBlob(context, myBlob)

        // log to table
        context.log("Logging Into The Log Table")
        await log(moment().format("YYYY-MM-DD HH:mm:ss"), countryName, format, rawDataUrl, validated.length, toValidate.length)
        context.log("Done")
    } catch (err) {
        context.log.error('Error', err)
        throw err
    }
};