const excelToJson = require("convert-excel-to-json")
const moment = require('moment-timezone')
const { moveBlob, getRawDataUrl } = require('./blobHelperFunctions')
const { upsertAll, insertToValidate, log } = require('./sqlHelperFunctions')

moment.tz.setDefault("UTC")

const currentTime = moment().toDate()

const country = "PHL"
const format = "PHL_1"
const countryName = "Philippines"

const sheet = "Sheet3"

const fieldMappings = {
    "CaseCode": "case_id_national",
    "Age": "age_in_years",
    "AgeGroup": "age_group",
    "Sex": "sex",
    "DateRepConf": "report_date",
    "DateDied": "death_date",
    "DateRecover": "recovery_date",
    "Admitted": "hospitalization",
    "RegionRes": "residency_sub_national_1_name",
    "ProvRes": "residency_sub_national_2_name",
    "CityMunRes": "residency_sub_national_3_name",
    "CityMuniPSGC": "residency_sub_national_3_code"
}

const fields = [
    "case_id_national",
    "age_in_years",
    "age_group",
    "sex",
    "report_date",
    "death_date",
    "recovery_date",
    "hospitalization",
    "residency_sub_national_1_name",
    "residency_sub_national_2_name",
    "residency_sub_national_3_name",
    "residency_sub_national_3_code"
]

function processSex(value) {
    if (value) {
        if (value === "Male") {
            return "M"
        }

        if (value === "Female") {
            return "F"
        }
    }
    return value
}

function transformData(d) {
    new_d = {}
    Object.keys(d).forEach(key => {
        const value = d[key] && d[key].toString().trim() !== "null" ? d[key].toString().trim() : null
        switch (key) {
            case "Sex":
                new_d[fieldMappings[key]] = processSex(value)
                break
            case "Admitted":
                new_d[fieldMappings[key]] = value && value === "Yes"
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

const sexCategories = ["m", "f"]

function validate(d) {
    const ageNumber = d["age_in_years"]
    return (d["sex"] ? sexCategories.some(c => c === d["sex"].toLowerCase()) : true) &&
        (ageNumber ? ageNumber < 105 && ageNumber >= 0 : true)
}

function mapDataWithNewKey(data, sourceUrl, rawDataUrl, sourceUpdateDate) {
     return data.map(d => {
        const new_d = transformData(d)
        new_d["valid"] = validate(new_d)
        new_d["datetime_of_intial_extraction"] = currentTime
        new_d["datetime_of_update_by_source_latest_extraction"] = sourceUpdateDate
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
        const rawDataUrl = getRawDataUrl(context.bindingData.blobTrigger)
        const sourceUpdateDateString = /\d{8}/.exec(context.bindingData.name)[0]
        const sourceUpdateDate = moment(sourceUpdateDateString, "YYYYMMDD").toDate()
        const data = excelToJson({
            source: myBlob,
            header: {
                rows: 1
            },
            sheets: [sheet],
            columnToKey: {
                A: "CaseCode",
                B: "Age",
                C: "AgeGroup",
                D: "Sex",
                E: "DateRepConf",
                F: "DateDied",
                G: "DateRecover",
                H: "RemovalType",
                I: "DateRepRem",
                J: "Admitted",
                K: "RegionRes",
                L: "ProvRes",
                M: "CityMunRes",
                N: "CityMuniPSGC",
                O: "HealthStatus",
                P: "Quarantined",
                Q: "DateOnset",
                R: "Pregnanttab"
            }
        })[sheet]
        const mappedData = mapDataWithNewKey(data, process.env["SOURCE_URL"], rawDataUrl, sourceUpdateDate)
        
        const [validated, toValidate] = mappedData.reduce((grouped, d) => {
            if(d.valid) {
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
        }, [[],[]])
        
        // upsert validated data
        context.log("Upserting Validated Data", validated.length)
        if(validated.length > 0)
            await upsertAll(validated)
        
        // insert invalidated data
        context.log("Inserting Data To Be Validated", toValidate.length)
        if(toValidate.length > 0) 
            await insertToValidate(toValidate)

        // move blob to processed folder
        context.log("Moving blob")
        const targetBlobPath = await moveBlob(context, myBlob)

        // log to table
        context.log("Logging Into The Log Table")
        await log(moment().format("YYYY-MM-DD HH:mm:ss"), countryName, format, rawDataUrl, validated.length, toValidate.length)
        context.log("Done")
    } catch(err) {
        context.log.error('Error', err)
        throw err
    }
};