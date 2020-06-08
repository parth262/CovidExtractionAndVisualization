export const headerTitle = "ADB WHO Covid Surveillance Platform"

const allFields = ["country", "patient_uid", "source_sub_national_1_code", "source_sub_national_1_name", "source_sub_national_2_code", "source_sub_national_2_name", "source_sub_national_3_code", "source_sub_national_3_name", "case_id_national", "case_id_scope_national", "case_id_sub_national_1", "case_id_scope_sub_national_1", "case_id_sub_national_2", "case_id_scope_sub_national_2", "case_id_sub_national_3", "case_id_scope_sub_national_3", "death_id_national", "death_id_scope_national", "recovered_id_national", "recovered_id_scope_national", "age_in_years", "age_in_months", "age_group", "year_of_birth", "sex", "citizenship_nationality_country", "residency_country", "residency_status", "visa_status", "residency_sub_national_1_name", "residency_sub_national_1_code", "residency_sub_national_2_name", "residency_sub_national_2_code", "residency_sub_national_3_name", "residency_sub_national_3_code", "travel_history", "travel_history_international", "travel_history_arrival_entry_date_into_country_of_diagnosis", "travel_history_1_country", "travel_history_1_start_date", "travel_history_1_end_date", "travel_history_2_country", "travel_history_2_start_date", "travel_history_2_end_date", "travel_history_3_country", "travel_history_3_start_date", "travel_history_3_end_date", "source_case_1_id_national", "source_case_1_relationship", "source_case_2_id_national", "source_case_2_relationship", "source_case_3_id_national", "source_case_3_relationship", "exposure_history_known", "exposure_history", "exposure_history_links", "exposure_history_cluster", "exposure_history_post_onset", "linked_to_cluster_exposure_to_known_case", "residence", "current_location", "employment_position", "employment_location", "status", "status_initial", "status_final", "hospitalization", "hospitalization_location", "health_authority_jurisdiction_in_charge", "self_isolation_self_quarantine_home_isolation", "presentation_to_health_facility_date", "symptom_onset_date", "test_sample_collection_date", "test_result_confirmation_date", "report_date", "hospitalization_date", "recovery_date", "discharge_date", "death_date", "symptoms_present_at_presentation_testing", "symptom_sore_throat", "symptom_fever", "symptom_cough", "symptom_chills", "symptom_myalgia", "symptom_fatigue", "symptom_shortness_of_breath", "symptom_runny_nose", "symptom_others", "comorbidity_pregnancy", "comorbidity_immunodeficiency_including_hiv", "comorbidity_cardiovacsular_disease_including_hypertension", "comorbidity_diabetes", "comorbidity_liver_disease", "comorbidity_renal_disease", "comorbidity_chronic_neurological_or_neuromuscular_disease", "comorbidity_malignancy", "comorbidity_chronic_lung_disease", "comorbidity_other", "cause_of_death_known", "cause_of_death", "format", "timestamp", "raw_data", "startline", "endline", "source_url", "datetime_of_latest_extraction", "datetime_of_intial_extraction", "datetime_of_update_by_source_latest_extraction", "source_country", "source_country_name"]

export const countryToFieldsMapping: { [country: string]: string[] } = {
    "Japan": ["country", 'case_id_national', 'age_group', 'sex', 'residency_sub_national_1_name', 'residency_sub_national_1_code', 'test_result_confirmation_date', 'format', 'timestamp', 'raw_data', 'source_url', 'datetime_of_latest_extraction', 'datetime_of_intial_extraction', 'datetime_of_update_by_source_latest_extraction', 'source_country', 'source_country_name'],
    "Philippines": ["country", 'case_id_national', 'age_in_years', 'age_group', 'sex', 'residency_sub_national_1_name', 'residency_sub_national_2_name', 'residency_sub_national_3_name', 'residency_sub_national_3_code', 'hospitalization', 'report_date', 'recovery_date', 'death_date', 'format', 'timestamp', 'raw_data', 'source_url', 'datetime_of_latest_extraction', 'datetime_of_intial_extraction', 'datetime_of_update_by_source_latest_extraction', 'source_country', 'source_country_name'],
    "Singapore": ['country', 'case_id_national', 'hospitalization_location', 'age_in_years', 'sex', 'citizenship_nationality_country', 'residency_status', 'travel_history_international', 'travel_history_1_country', 'exposure_history', 'exposure_history_links', 'exposure_history_cluster', 'exposure_history_post_onset', 'linked_to_cluster_exposure_to_known_case', 'test_result_confirmation_date', 'symptom_onset_date', 'symptoms_present_at_presentation_testing', 'format', 'timestamp', 'raw_data', 'source_url', 'datetime_of_latest_extraction', 'datetime_of_intial_extraction', 'datetime_of_update_by_source_latest_extraction', 'source_country', 'source_country_name'],
    "Hong Kong": ["country", "case_id_national", "age_in_years", "sex", "residency_status", "exposure_history_known", "exposure_history", "status_final", "hospitalization_location", "symptom_onset_date", "report_date", "symptoms_present_at_presentation_testing", 'format', 'timestamp', 'raw_data', 'source_url', 'datetime_of_latest_extraction', 'datetime_of_intial_extraction', 'datetime_of_update_by_source_latest_extraction', 'source_country', 'source_country_name'],
    "New Zealand": ['age_group', 'sex', 'report_date', 'health_authority_jurisdiction_in_charge', 'travel_history_international', 'travel_history_1_country', 'travel_history_1_end_date', 'travel_history_arrival_entry_date_into_country_of_diagnosis', 'datetime_of_latest_extraction', 'datetime_of_intial_extraction', 'datetime_of_update_by_source_latest_extraction', 'source_url', 'raw_data', 'source_country', 'source_country_name', 'country', 'format', 'timestamp', 'raw_data'],
    "Vietnam": ['case_id_national', 'age_in_years', 'sex', 'citizenship_nationality_country', 'residency_sub_national_1_name', 'status_final', 'format', 'timestamp', 'raw_data', 'source_url', 'datetime_of_latest_extraction', 'datetime_of_intial_extraction', 'datetime_of_update_by_source_latest_extraction', 'source_country', 'source_country_name']
}

export const countries = ["All", ...Object.keys(countryToFieldsMapping)]

const fieldsToKeepLast = ["source_url"]
const fieldsWithValues = Array.from(new Set(Object.values(countryToFieldsMapping).reduce((flatArray, value) => {
    return flatArray.concat(value.filter(field => !fieldsToKeepLast.some(f => f === field)))
}, []))).concat(fieldsToKeepLast)

// union of fields of all countries
countryToFieldsMapping["All"] = allFields.filter(field => fieldsWithValues.includes(field))

export enum Filter {
    CHECKBOX_FILTER,
    NUMBER_FILTER,
    DATE_FILTER
}

export const fieldsToFilterMapping: { [field: string]: Filter } = {
    "age_group": Filter.CHECKBOX_FILTER,
    "sex": Filter.CHECKBOX_FILTER,
    "status": Filter.CHECKBOX_FILTER,
    "status_initial": Filter.CHECKBOX_FILTER,
    "status_final": Filter.CHECKBOX_FILTER,
    "hospitalization": Filter.CHECKBOX_FILTER,
    "hospitalization_location": Filter.CHECKBOX_FILTER,
    "health_authority_jurisdiction_in_charge": Filter.CHECKBOX_FILTER,
    "symptom_sore_throat": Filter.CHECKBOX_FILTER,
    "symptom_fever": Filter.CHECKBOX_FILTER,
    "symptom_cough": Filter.CHECKBOX_FILTER,
    "symptom_chills": Filter.CHECKBOX_FILTER,
    "symptom_myalgia": Filter.CHECKBOX_FILTER,
    "symptom_fatigue": Filter.CHECKBOX_FILTER,
    "symptom_shortness_of_breath": Filter.CHECKBOX_FILTER,
    "symptom_runny_nose": Filter.CHECKBOX_FILTER,
    "symptom_others": Filter.CHECKBOX_FILTER,
    "comorbidity_pregnancy": Filter.CHECKBOX_FILTER,
    "comorbidity_immunodeficiency_including_hiv": Filter.CHECKBOX_FILTER,
    "comorbidity_cardiovacsular_disease_including_hypertension": Filter.CHECKBOX_FILTER,
    "comorbidity_diabetes": Filter.CHECKBOX_FILTER,
    "comorbidity_liver_disease": Filter.CHECKBOX_FILTER,
    "comorbidity_renal_disease": Filter.CHECKBOX_FILTER,
    "comorbidity_chronic_neurological_or_neuromuscular_disease": Filter.CHECKBOX_FILTER,
    "comorbidity_malignancy": Filter.CHECKBOX_FILTER,
    "comorbidity_chronic_lung_disease": Filter.CHECKBOX_FILTER,
    "comorbidity_other": Filter.CHECKBOX_FILTER,
    "exposure_history_known": Filter.CHECKBOX_FILTER,
    "exposure_history": Filter.CHECKBOX_FILTER,
    "exposure_history_links": Filter.CHECKBOX_FILTER,
    "exposure_history_cluster": Filter.CHECKBOX_FILTER,
    "exposure_history_post_onset": Filter.CHECKBOX_FILTER,
    "cause_of_death_known": Filter.CHECKBOX_FILTER,
    "cause_of_death": Filter.CHECKBOX_FILTER,
    "residency_country": Filter.CHECKBOX_FILTER,
    "residency_status": Filter.CHECKBOX_FILTER,
    "residence": Filter.CHECKBOX_FILTER,
    "current_location": Filter.CHECKBOX_FILTER,
    "citizenship_nationality_country": Filter.CHECKBOX_FILTER,
    "travel_history": Filter.CHECKBOX_FILTER,
    "travel_history_international": Filter.CHECKBOX_FILTER,
    "travel_history_1_country": Filter.CHECKBOX_FILTER,
    "travel_history_2_country": Filter.CHECKBOX_FILTER,
    "travel_history_3_country": Filter.CHECKBOX_FILTER,
    "source_sub_national_1_name": Filter.CHECKBOX_FILTER,
    "source_sub_national_1_code": Filter.CHECKBOX_FILTER,
    "source_sub_national_2_name": Filter.CHECKBOX_FILTER,
    "source_sub_national_2_code": Filter.CHECKBOX_FILTER,
    "source_sub_national_3_name": Filter.CHECKBOX_FILTER,
    "source_sub_national_3_code": Filter.CHECKBOX_FILTER,
    "visa_status": Filter.CHECKBOX_FILTER,
    "residency_sub_national_1_name": Filter.CHECKBOX_FILTER,
    "residency_sub_national_1_code": Filter.CHECKBOX_FILTER,
    "residency_sub_national_2_name": Filter.CHECKBOX_FILTER,
    "residency_sub_national_2_code": Filter.CHECKBOX_FILTER,
    "residency_sub_national_3_name": Filter.CHECKBOX_FILTER,
    "residency_sub_national_3_code": Filter.CHECKBOX_FILTER,
    "employment_position": Filter.CHECKBOX_FILTER,
    "employment_location": Filter.CHECKBOX_FILTER,
    "format": Filter.CHECKBOX_FILTER,
    "age_in_years": Filter.NUMBER_FILTER,
    "age_in_months": Filter.NUMBER_FILTER,
    "year_of_birth": Filter.NUMBER_FILTER,
    "datetime_of_latest_extraction": Filter.DATE_FILTER,
    "datetime_of_intial_extraction": Filter.DATE_FILTER,
    "datetime_of_update_by_source_latest_extraction": Filter.DATE_FILTER,
    "travel_history_arrival_entry_date_into_country_of_diagnosis": Filter.DATE_FILTER,
    "travel_history_1_start_date": Filter.DATE_FILTER,
    "travel_history_1_end_date": Filter.DATE_FILTER,
    "travel_history_2_start_date": Filter.DATE_FILTER,
    "travel_history_2_end_date": Filter.DATE_FILTER,
    "travel_history_3_start_date": Filter.DATE_FILTER,
    "travel_history_3_end_date": Filter.DATE_FILTER,
    "presentation_to_health_facility_date": Filter.DATE_FILTER,
    "symptom_onset_date": Filter.DATE_FILTER,
    "test_sample_collection_date": Filter.DATE_FILTER,
    "test_result_confirmation_date": Filter.DATE_FILTER,
    "report_date": Filter.DATE_FILTER,
    "hospitalization_date": Filter.DATE_FILTER,
    "recovery_date": Filter.DATE_FILTER,
    "discharge_date": Filter.DATE_FILTER,
    "death_date": Filter.DATE_FILTER,
    "timestamp": Filter.DATE_FILTER
}

export const fieldfacetCountMap: { [field: string]: number } = {
    "source_sub_national_1_name": 10,
    "source_sub_national_2_name": 10,
    "source_sub_national_3_name": 10,
    "age_group": 10,
    "sex": 10,
    "citizenship_nationality_country": 10,
    "residency_country": 10,
    "residency_status": 10,
    "visa_status": 10,
    "residency_sub_national_1_name": 10,
    "residency_sub_national_2_name": 10,
    "residency_sub_national_3_name": 10,
    "travel_history": 10,
    "travel_history_international": 10,
    "travel_history_1_country": 10,
    "travel_history_2_country": 10,
    "travel_history_3_country": 10,
    "exposure_history_known": 10,
    "exposure_history": 10,
    "exposure_history_links": 10,
    "exposure_history_cluster": 10,
    "exposure_history_post_onset": 10,
    "residence": 10,
    "current_location": 10,
    "employment_position": 10,
    "employment_location": 10,
    "status": 10,
    "status_initial": 10,
    "status_final": 10,
    "hospitalization": 10,
    "hospitalization_location": 10,
    "health_authority_jurisdiction_in_charge": 10,
    "symptom_sore_throat": 10,
    "symptom_fever": 10,
    "symptom_cough": 10,
    "symptom_chills": 10,
    "symptom_myalgia": 10,
    "symptom_fatigue": 10,
    "symptom_shortness_of_breath": 10,
    "symptom_runny_nose": 10,
    "symptom_others": 10,
    "comorbidity_pregnancy": 10,
    "comorbidity_immunodeficiency_including_hiv": 10,
    "comorbidity_cardiovacsular_disease_including_hypertension": 10,
    "comorbidity_diabetes": 10,
    "comorbidity_liver_disease": 10,
    "comorbidity_renal_disease": 10,
    "comorbidity_chronic_neurological_or_neuromuscular_disease": 10,
    "comorbidity_malignancy": 10,
    "comorbidity_chronic_lung_disease": 10,
    "comorbidity_other": 10,
    "cause_of_death_known": 10,
    "cause_of_death": 10,
    "format": 10
}

function findAllIndicesOf(field: string, value: string) {
    const indices: number[] = []
    for (let i = 0; i < field.length; i++) {
        if (field[i] === value) {
            indices.push(i + 1)
        }
    }
    return indices
}

function capitalize(field: string, i: number) {
    return field.slice(0, i) + field.charAt(i).toUpperCase() + field.slice(i + 1)
}

export function normalizeFieldName(field: string) {
    if (field === "datetime_of_update_by_source_latest_extraction") {
        return "Datetime Of Update By Source"
    }
    //indices of character to capitalize
    const indices = findAllIndicesOf(field, "_")
    //capitalize first character too
    indices.push(0)
    let newField = field.replace(/_/g, " ")
    indices.forEach(index => {
        newField = capitalize(newField, index)
    })
    return newField
}