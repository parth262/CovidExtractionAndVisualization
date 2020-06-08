const csv = require("csvtojson")
const moment = require('moment-timezone')
const { moveBlob, getRawDataUrl } = require('./blobHelperFunctions')
const { truncateInsert, insertToValidate, log } = require('./sqlHelperFunctions')

moment.tz.setDefault("UTC")

const fieldMappings = {
    'Age group': 'age_group',
    'Sex': 'sex',
    'Overseas Travel': 'travel_history_international',
    'Arrival date': 'travel_history_arrival_entry_date_into_country_of_diagnosis',
    'Last country before return': 'travel_history_1_country',
    'Flight departure date': 'travel_history_1_end_date',
    'DHB': 'health_authority_jurisdiction_in_charge',
    'Date of report': 'report_date',
    'source_update_date': 'datetime_of_update_by_source_latest_extraction'
}

const fields = Object.values(fieldMappings)

const country = "NZL"
const countryName = "New Zealand"
const format = "NZL_1"
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
                ...d
            })
        }
        return grouped
    }, [[], []])

    // upsert validated data
    if (validated.length > 0) {
        context.log("Truncate Insert Validated Data", validated.length)
        await truncateInsert(validated, format)
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
        new_d["datetime_of_latest_extraction"] = currentTime
        new_d["source_url"] = sourceUrl
        new_d["raw_data"] = rawDataUrl
        new_d["source_country"] = country
        new_d["source_country_name"] = countryName
        new_d["format"] = format
        new_d["timestamp"] = currentTime
        new_d["country"] = country
        return new_d
    })
}

function transformData(d) {
    const new_d = {}
    Object.keys(d).forEach(key => {
        const value = d[key] && d[key].toString().trim() !== "null" ? d[key].toString().trim() : null
        switch (key) {
            case "Sex":
                new_d[fieldMappings[key]] = value && value.charAt(0)
                break
            case "Overseas Travel":
                new_d[fieldMappings[key]] = value && value.toLowerCase() === "yes"
                break
            case "Arrival date":
            case "Flight departure date":
            case "source_update_date":
                new_d[fieldMappings[key]] = value && new Date(+value)
                break
            case "Date of report":
                new_d[fieldMappings[key]] = value && moment.utc(value, "DD/MM/YYYY").toDate()
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
    return d["sex"] ? sexCategories.some(c => c === d["sex"].toLowerCase()) : true
}