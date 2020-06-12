const csv = require("csvtojson")
const moment = require('moment-timezone')
const { moveBlob, getRawDataUrl } = require('./blobHelperFunctions')
const { upsertAll, insertToValidate, log } = require('./sqlHelperFunctions')

moment.tz.setDefault("UTC")

const fieldMappings = {
    'patient': "case_id_national",
    // 'personal_information': "sex",
    'personal_information': "age_group",
    'institution': "hospitalization_location",
    'confirmation_date': 'test_result_confirmation_date',
    'source_update_date': 'datetime_of_update_by_source_latest_extraction'
}

const fields = [
    "case_id_national",
    "sex",
    "age_group",
    "hospitalization_location",
    'test_result_confirmation_date',
    'datetime_of_update_by_source_latest_extraction'
]

const country = "KOR"
const countryName = "South Korea"
const format = "KOR_3"
const digitRegex = /[-+]?\d+/
const currentTime = moment().toDate()
const sexCategories = ["m", "f"]
const sourceSubNation1Code = "KR-27"
const sourceSubNation1Name = "Daegu"

module.exports = async function (context, myBlob) {
    const rawDataUrl = getRawDataUrl(context.bindingData.blobTrigger)
    const data = await csv({ delimiter: ";" }).fromString(myBlob.toString())
    const mappedData = mapDataWithNewKey(data, process.env["SOURCE_URL_DAEGU"], rawDataUrl)
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
        new_d["case_id_scope_national"] = country
        new_d["datetime_of_intial_extraction"] = currentTime
        new_d["source_url"] = sourceUrl
        new_d["raw_data"] = rawDataUrl
        new_d["source_country"] = country
        new_d["source_country_name"] = countryName
        new_d["source_sub_national_1_code"] = sourceSubNation1Code
        new_d["source_sub_national_1_name"] = sourceSubNation1Name
        new_d["case_id_scope_sub_national_1"] = sourceSubNation1Code
        new_d["format"] = format
        return new_d
    })
}

function getGender(value) {
    if (["(yeo)", "(female)"].includes(value)) {
        return "F"
    }
    if (["(south)", "(male)"].includes(value)) {
        return "M"
    }
    return value
}

function transformData(d) {
    const new_d = {}
    Object.keys(d).forEach(key => {
        const value = d[key] && d[key].toString().trim() !== "null" ? d[key].toString().trim() : null
        switch (key) {
            case "patient":
                const extractedId = digitRegex.exec(value)
                if (extractedId) {
                    new_d[fieldMappings[key]] = extractedId[0]//value.replace("#", "").trim()
                }
                break
            case "personal_information":
                const extractedNumber = value && digitRegex.exec(value)
                if (extractedNumber) {
                    new_d["age_group"] = extractedNumber[0]
                }
                const extractedGender = value && /\([A-Za-z]+\)/.exec(value)
                if (extractedGender) {
                    const gender = extractedGender[0]
                    new_d["sex"] = getGender(gender.toLowerCase())
                }
                break
            case "confirmation_date":
                new_d[fieldMappings[key]] = value && moment.utc(value, "YYYY-MM-DD").toDate()
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
    return d["sex"] ? sexCategories.some(c => c === d["sex"].toLowerCase()) : true
}