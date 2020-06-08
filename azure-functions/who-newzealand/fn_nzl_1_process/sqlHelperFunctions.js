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

const truncateInsertFieldDataTypeMapping = {
    'report_date': sql.Date,
    'sex': sql.VarChar(10),
    'age_group': sql.VarChar(20),
    'health_authority_jurisdiction_in_charge': sql.VarChar(20),
    'travel_history_international': sql.Bit,
    'travel_history_1_country': sql.VarChar(100),
    'travel_history_1_end_date': sql.Date,
    'travel_history_arrival_entry_date_into_country_of_diagnosis': sql.Date,
    'datetime_of_update_by_source_latest_extraction': sql.DateTime,
    'datetime_of_intial_extraction': sql.DateTime,
    'datetime_of_latest_extraction': sql.DateTime,
    'source_url': sql.VarChar(sql.MAX),
    'raw_data': sql.VarChar(sql.MAX),
    'source_country': sql.VarChar(100),
    'source_country_name': sql.VarChar(100),
    'country': sql.VarChar(100),
    'format': sql.VarChar(100),
    'timestamp': sql.DateTime,
    'raw_data': sql.VarChar(sql.MAX),
}

const insertToValidateFieldDataTypeMapping = {
    ...truncateInsertFieldDataTypeMapping,
    'validation_status': sql.VarChar(100)
}

const mainTable = "[processed].[csp_case_details]"

async function truncateInsert(data, format) {
    const conn = await sql.connect(config)
    const transaction = await new sql.Transaction(conn).begin()

    try {
        //truncate
        const deleteRequest = new sql.Request(transaction)
        const deleteQuery = `DELETE FROM ${mainTable} WHERE format='${format}'`
        await deleteRequest.query(deleteQuery)

        //insert
        const table = new sql.Table(mainTable)
        Object.keys(truncateInsertFieldDataTypeMapping).forEach(key => {
            table.columns.add(key, truncateInsertFieldDataTypeMapping[key], { nullable: true })
        })
        data.forEach(d => {
            table.rows.add(...Object.keys(truncateInsertFieldDataTypeMapping).map(key => d[key]))
        })
        const request = new sql.Request(transaction)
        await request.bulk(table)

        await transaction.commit()
    } catch (e) {
        await transaction.rollback()
    }

    conn.close()
}

async function insertToValidate(data) {
    const table = new sql.Table('processed.csp_to_validate')
    Object.keys(insertToValidateFieldDataTypeMapping).forEach(key => {
        table.columns.add(key, insertToValidateFieldDataTypeMapping[key], { nullable: true })
    })
    data.forEach(d => {
        table.rows.add(...Object.keys(insertToValidateFieldDataTypeMapping).map(key => d[key]))
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
    truncateInsert,
    insertToValidate,
    log
}