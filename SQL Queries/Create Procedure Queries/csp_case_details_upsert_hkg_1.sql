create procedure [processed].[csp_case_details_upsert_hkg_1]
	@source_url VARCHAR(MAX),
	@case_id_national VARCHAR(50),
	@datetime_of_intial_extraction	DATETIME,
	@datetime_of_update_by_source_latest_extraction DATETIME,
	@source_country VARCHAR(20),
	@source_country_name VARCHAR(100),
	@age_in_years INT,
	@sex VARCHAR(10),
	@report_date DATE,
	@hospitalization_location VARCHAR(100),
	@status_final VARCHAR(20),
	@residency_status VARCHAR(20),
	@exposure_history_known BIT,
	@exposure_history VARCHAR(100),
	@symptoms_present_at_presentation_testing BIT,
	@symptom_onset_date DATE,
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
			age_in_years=@age_in_years,
			sex=@sex,
			report_date=@report_date,
			hospitalization_location=@hospitalization_location,
			status_final=@status_final,
			residency_status=@residency_status,
			exposure_history_known=@exposure_history_known,
			exposure_history=@exposure_history,
			symptoms_present_at_presentation_testing=@symptoms_present_at_presentation_testing,
			symptom_onset_date=@symptom_onset_date,
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
		age_in_years,
		sex,
		report_date,
		hospitalization_location,
		status_final,
		residency_status,
		exposure_history_known,
		exposure_history,
		symptoms_present_at_presentation_testing,
		symptom_onset_date,
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
		@age_in_years,
		@sex,
		@report_date,
		@hospitalization_location,
		@status_final,
		@residency_status,
		@exposure_history_known,
		@exposure_history,
		@symptoms_present_at_presentation_testing,
		@symptom_onset_date,
		@source_country,
		@format,
		@datetime_of_intial_extraction,
		@raw_data
	);
	END
COMMIT
END