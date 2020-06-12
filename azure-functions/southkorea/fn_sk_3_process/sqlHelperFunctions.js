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
    'case_id_scope_national': sql.VarChar(20),
    'datetime_of_intial_extraction': sql.DateTime,
    'datetime_of_latest_extraction': sql.DateTime,
    'datetime_of_update_by_source_latest_extraction': sql.DateTime,
    'source_country': sql.VarChar(100),
    'source_country_name': sql.VarChar(100),
    'age_group': sql.VarChar(20),
    'sex': sql.VarChar(10),
    'test_result_confirmation_date': sql.Date,
    'hospitalization_location': sql.VarChar(100),
    'source_sub_national_1_code': sql.VarChar(20),
    'source_sub_national_1_name': sql.VarChar(100),
    'case_id_scope_sub_national_1': sql.VarChar(20),
    'country': sql.VarChar(100),
    'format': sql.VarChar(100),
    'timestamp': sql.DateTime,
    'raw_data': sql.VarChar(sql.MAX),
    'validation_status': sql.VarChar(100)
}

const storedProcedure = "processed.csp_case_details_upsert_kor_3"

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
    pool.close()
}

async function insertToValidate(data) {
    const table = new sql.Table('processed.csp_to_validate')
    Object.keys(fieldDataTypeMapping).forEach(key => {
        table.columns.add(key, fieldDataTypeMapping[key], { nullable: true })
    })
    data.forEach(d => {
        table.rows.add(...Object.keys(fieldDataTypeMapping).map(key => d[key]))
    })
    const conn = await sql.connect(config)
    const request = conn.request()
    await request.bulk(table)
    conn.close()
}

async function log(country, format, timestamp, rawDataUrl, cleanCount, validationCount) {
    const values = `'${timestamp}', '${country}', '${format}', '${rawDataUrl}', ${cleanCount}, ${validationCount}`
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