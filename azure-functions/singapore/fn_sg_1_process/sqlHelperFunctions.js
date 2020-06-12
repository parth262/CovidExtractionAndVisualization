var sql = require('mssql')

const logConfig = {
    user: process.env["SQLUsername"],
    password: process.env["SQLPassword"],
    server: 'covidsql.database.windows.net',
    database: 'CovidDB'
}

const config = {
    pool: {
        max: 100,
    },
    ...logConfig
}

const fieldDataTypeMapping = {
    'source_url': sql.VarChar(sql.MAX),
    'case_id_national': sql.VarChar(100),
    'datetime_of_intial_extraction': sql.DateTime,
    'datetime_of_latest_extraction': sql.DateTime,
    'datetime_of_update_by_source_latest_extraction': sql.DateTime,
    'source_country': sql.VarChar(100),
    'source_country_name': sql.VarChar(100),
    'hospitalization_location': sql.VarChar(100),
    'age_in_years': sql.Int,
    'sex': sql.VarChar(100),
    'citizenship_nationality_country': sql.VarChar(100),
    'residency_status': sql.VarChar(100),
    'travel_history_international': sql.Bit,
    'travel_history_1_country': sql.VarChar(100),
    'exposure_history': sql.VarChar(100),
    'exposure_history_links': sql.VarChar(100),
    'exposure_history_cluster': sql.VarChar(100),
    'test_result_confirmation_date': sql.Date,
    'country': sql.VarChar(100),
    'format': sql.VarChar(100),
    'timestamp': sql.DateTime,
    'raw_data': sql.VarChar(sql.MAX),
    'validation_status': sql.VarChar(100)
}

const storedProcedure = "processed.csp_case_details_upsert_sg_1"

async function upsert(request, d) {
    Object.keys(d).forEach(key => {
        if (key !== "valid")
            request.input(key, d[key])
    })
    return request.execute(storedProcedure)
}

async function upsertAll(data) {
    const pool = await sql.connect(config)
    let batch_count = Math.min(data.length, config.pool.max)
    let start = 0
    let end = start + batch_count
    let remaining = data.length
    while (remaining > 0) {
        const results = await Promise.all(data.slice(start, end)
            .map(d => upsert(pool.request(), d)))
        remaining -= batch_count
        start += batch_count
        end = start + batch_count
    }
    await pool.close()
}

async function insertToValidate(data) {
    const table = new sql.Table('processed.csp_to_validate')
    Object.keys(fieldDataTypeMapping).forEach(key => {
        table.columns.add(key, fieldDataTypeMapping[key], { nullable: true })
    })
    data.forEach(d => {
        table.rows.add(...Object.keys(fieldDataTypeMapping).map(key => d[key]))
    })
    const conn = await sql.connect({stream: true, ...config})
    const request = conn.request()
    await request.bulk(table)
    conn.close()
}

async function log(timestamp, countryName, format, rawDataUrl, cleanCount, validationCount) {
    const values = `'${timestamp}', '${countryName}', '${format}', '${rawDataUrl}', ${cleanCount}, ${validationCount}`
    const query = `insert into [logs].[csp_process_job_logging] ([timestamp],[country],[format],[raw_data],[clean_count],[validation_count]) values (${values})`
    const conn = await sql.connect(logConfig)
    const logResult = await conn.query(query)
    conn.close()
    return logResult
}

module.exports = {
    upsertAll,
    insertToValidate,
    log
}