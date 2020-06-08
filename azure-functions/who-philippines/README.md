## Overview
Scrapping and processing functions for Philippines' COVID related data

### Prerequisite steps:
1. Create following container/s in Azure Blob Storage created to save covid data
    1. phl-1
2. Open this project in **Visual Studio Code**

### Steps to Debug locally:
1. Create **local.settings.json** file with following values:
    - Contents of the file will look like:
    ```json
    {
        "IsEncrypted": false,
        "Values": {
            "AzureWebJobsStorage": "<connection string>",
            "FUNCTIONS_WORKER_RUNTIME": "node",
            "SOURCE_URL": "https://drive.google.com/drive/folders/1w_O-vweBFbqCgzgmCpux2F0HVB4P6ni2?ths=true",
            "AZURE_STORAGE_CONNECTION_STRING": "<connection string>",
            "whocovidstorage_STORAGE": "<connection string>",
            "SQLUsername": "<sql username>",
            "SQLPassword": "<sql password>"
        }
    }
    ```
    - **AzureWebJobsStorage**: Connection String of Storage Account configured when creating Azure Function App
    - **AZURE_STORAGE_CONNECTION_STRING**: Connection String of Storage Account where the covid data will be saved
    - **whocovidstorage_STORAGE**: Connection String of Storage Account where the covid data will be saved
    - **SQLUsername**: Username for SQL Database
    - **SQLPassword**: Password for SQL Database

2. Follow [this](https://docs.microsoft.com/en-us/azure/javascript/tutorial-vscode-serverless-node-03) to debug


### Steps to Deploy

2. Add all the values of **local.settings.json** file to **Configuration** in created Azure Function App.       
    > These values are treated as environment variables by Azure Function

5. Follow [these steps](https://docs.microsoft.com/en-us/azure/javascript/tutorial-vscode-serverless-node-04) to deploy the function to Azure