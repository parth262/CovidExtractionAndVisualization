create procedure [processed].[csp_case_details_upsert_sg_2]
	@source_url VARCHAR(MAX),
	@case_id_national VARCHAR(50),
	@datetime_of_intial_extraction DATETIME,
	@datetime_of_update_by_source_latest_extraction DATETIME,
	@source_country VARCHAR(20),
	@source_country_name VARCHAR(100),
	@age_in_years INT,
	@sex VARCHAR(10),
	@citizenship_nationality_country VARCHAR(20),
	@travel_history_1_country VARCHAR(100),
	@exposure_history VARCHAR(100),
	@exposure_history_links VARCHAR(100),
	@exposure_history_cluster VARCHAR(100),
	@exposure_history_post_onset VARCHAR(100),
	@test_result_confirmation_date DATE,
	@linked_to_cluster_exposure_to_known_case BIT,
	@symptom_onset_date DATE,
	@symptoms_present_at_presentation_testing BIT,
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
			citizenship_nationality_country=@citizenship_nationality_country,
			travel_history_1_country=@travel_history_1_country,
			exposure_history=@exposure_history,
			exposure_history_links=@exposure_history_links,
			exposure_history_cluster=@exposure_history_cluster,
			exposure_history_post_onset=@exposure_history_post_onset,
			test_result_confirmation_date=@test_result_confirmation_date,
			linked_to_cluster_exposure_to_known_case=@linked_to_cluster_exposure_to_known_case,
			symptom_onset_date=@symptom_onset_date,
			symptoms_present_at_presentation_testing=@symptoms_present_at_presentation_testing,
			raw_data=@raw_data
		WHERE case_id_national=@case_id_national and source_country=@source_country;
	END ELSE BEGIN
     INSERT INTO [processed].[csp_case_details] (
		source_url,
		case_id_national,
		datetime_of_intial_extraction,
		datetime_of_latest_extraction,
		datetime_of_update_by_source_latest_extraction,
		source_country,	
		source_country_name,
		age_in_years,
		sex,
		citizenship_nationality_country,
		travel_history_1_country,
		exposure_history,
		exposure_history_links,
		exposure_history_cluster,
		exposure_history_post_onset,
		test_result_confirmation_date,
		linked_to_cluster_exposure_to_known_case,
		symptom_onset_date,
		symptoms_present_at_presentation_testing,
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
		@citizenship_nationality_country,
		@travel_history_1_country,
		@exposure_history,
		@exposure_history_links,
		@exposure_history_cluster,
		@exposure_history_post_onset,
		@test_result_confirmation_date,
		@linked_to_cluster_exposure_to_known_case,
		@symptom_onset_date,
		@symptoms_present_at_presentation_testing,
		@source_country,
		@format,
		@datetime_of_intial_extraction,
		@raw_data
	);
	END
COMMIT
END