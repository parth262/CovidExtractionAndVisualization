create procedure [processed].[csp_case_details_upsert_kor_3]
	@case_id_national VARCHAR(50),
	@case_id_scope_national VARCHAR(20),
	@age_group VARCHAR(20),
	@sex VARCHAR(10),
	@test_result_confirmation_date DATE,
	@hospitalization_location VARCHAR(100),
	@datetime_of_update_by_source_latest_extraction DATETIME,
	@datetime_of_intial_extraction DATETIME,
	@source_url VARCHAR(MAX),
	@raw_data VARCHAR(MAX),
	@source_country VARCHAR(20),
	@source_country_name VARCHAR(100),
	@source_sub_national_1_code VARCHAR(20),
	@source_sub_national_1_name VARCHAR(100),
	@case_id_scope_sub_national_1 VARCHAR(20),
	@format VARCHAR(20)
AS
BEGIN
BEGIN TRAN
	IF NOT EXISTS(SELECT 1 FROM [processed].[csp_case_details] WHERE case_id_national=@case_id_national and source_country=@source_country) BEGIN
     INSERT INTO [processed].[csp_case_details] (
     	source_url,
     	case_id_national,
     	case_id_scope_national,
     	source_sub_national_1_code,
     	source_sub_national_1_name,
     	case_id_scope_sub_national_1,
     	datetime_of_latest_extraction,
     	datetime_of_intial_extraction,
     	datetime_of_update_by_source_latest_extraction,
     	source_country,
     	source_country_name,
		age_group,
		sex,		
		test_result_confirmation_date,
		hospitalization_location,
		[country],
		[format],
		[timestamp],
		[raw_data]
	) VALUES (
		@source_url,
		@case_id_national,
		@case_id_scope_national,
		@source_sub_national_1_code,
     	@source_sub_national_1_name,
     	@case_id_scope_sub_national_1,
		@datetime_of_intial_extraction,
		@datetime_of_intial_extraction,
		@datetime_of_update_by_source_latest_extraction,
		@source_country,
		@source_country_name,
		@age_group,
		@sex,
		@test_result_confirmation_date,
		@hospitalization_location,
		@source_country,
		@format,
		@datetime_of_intial_extraction,
		@raw_data
	);
	END
COMMIT
END