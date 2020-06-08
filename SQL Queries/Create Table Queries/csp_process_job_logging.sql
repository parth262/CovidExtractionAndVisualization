CREATE TABLE [logs].[csp_process_job_logging] (
    [timestamp] DATETIME,
    [country] VARCHAR(100),
    [format] VARCHAR(20),
    [raw_data] VARCHAR(MAX),
    [clean_count] INT,
    [validation_count] INT)



