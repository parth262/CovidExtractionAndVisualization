create procedure [processed].[csp_case_details_upsert_jpn_1]
	@source_url VARCHAR(MAX),
	@case_id_national VARCHAR(50),
	@datetime_of_intial_extraction	DATETIME,
	@datetime_of_update_by_source_latest_extraction DATETIME,
	@source_country VARCHAR(20),
	@source_country_name VARCHAR(100),
	@age_group VARCHAR(20),
	@sex VARCHAR(10),
	@residency_sub_national_1_name VARCHAR(100),
	@residency_sub_national_1_code VARCHAR(20),
	@test_result_confirmation_date DATE,
    @raw_data VARCHAR(MAX),
    @format VARCHAR(20)
AS
BEGIN
BEGIN TRAN
	IF EXISTS(SELECT 1 FROM [processed].[csp_case_details] WHERE case_id_national=@case_id_national and source_country=@source_country) BEGIN
		UPDATE [processed].[csp_case_details]
		SET 
			datetime_of_latest_extraction=@datetime_of_intial_extraction,
			datetime_of_update_by_source_latest_extraction=@datetime_of_update_by_source_latest_extraction,
			age_group=@age_group,
			sex=@sex,
			residency_sub_national_1_name=@residency_sub_national_1_name,
			residency_sub_national_1_code=@residency_sub_national_1_code,
			test_result_confirmation_date=@test_result_confirmation_date,
			raw_data=@raw_data
		WHERE case_id_national=@case_id_national and source_country=@source_country;
	END ELSE BEGIN
     INSERT INTO [processed].[csp_case_details] (
     	source_url,
     	case_id_national,
     	datetime_of_latest_extraction,
     	datetime_of_intial_extraction,
     	datetime_of_update_by_source_latest_extraction,
     	source_country,
     	source_country_name,
		age_group,
		sex,
		residency_sub_national_1_name,
		residency_sub_national_1_code,
		test_result_confirmation_date,
		[country],
		[format],
		[timestamp],
		[raw_data]
	) VALUES (
		@source_url,
		@case_id_national,
		@datetime_of_intial_extraction,
		@datetime_of_intial_extraction,
		@datetime_of_update_by_source_latest_extraction,
		@source_country,
		@source_country_name,
		@age_group,
		@sex,
		@residency_sub_national_1_name,
		@residency_sub_national_1_code,
		@test_result_confirmation_date,
		@source_country,
		@format,
		@datetime_of_intial_extraction,
		@raw_data
	);
	END
COMMIT
END