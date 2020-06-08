## Steps to set up WHO COVID Search Architecture in Azure

1. Create [**SQL Database**](https://docs.microsoft.com/en-us/azure/azure-sql/database/single-database-create-quickstart?tabs=azure-portal): to save covid data
    - Afterwards create tables with [these](SQL%20Queries/Create%20Table%20Queries) queries
    - Also create required procedures with [these](SQL%20Qeuries/Create%20Procedure%20Queries) queries

2. Create [**Azure Blob Storage**](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-create-account-block-blob?tabs=azure-portal#create-a-blockblobstorage-account-1): to save scrapped data

3. Create [**Azure Storage Account**](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&tabs=azure-portal#create-a-storage-account): to save Azure Function Apps' data.

4. Create [**Azure Search Service**](https://docs.microsoft.com/en-us/azure/search/search-create-service-portal): to index data from sql database
    - Follow [these](https://docs.microsoft.com/en-us/azure/search/search-get-started-portal) steps to create index for Azure SQL Database
    - Connect to SQL database when importing data
    - While configuring index:
        - Make all the fields Retrievable, Sortable, Facetable, Filterable.
        - Make all the fields, except *patient_uid*, Searchable
    - For indexer, select *Schedule* as *Hourly*
    - Atlast, put *datetime_of_latest_extraction* as *High watermark column* in Data Source settings and *Save*

5. Create [**Azure Web App**](who-search-ui): to host Search UI

6. Create [**Azure Translator Cognitive Service**](https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-apis-create-account?tabs=singleservice%2Clinux): to translate data from other languages to English

7. Create [**Azure Function Apps**](azure-functions): to host processing and scrapping functions for each country


*Notes*:
> By default Azure SQL database is not accessible from outside azure. Follow [these](https://docs.microsoft.com/en-us/azure/azure-sql/database/secure-database-tutorial#set-up-server-level-firewall-rules) steps to make it accessible to specific IP address.