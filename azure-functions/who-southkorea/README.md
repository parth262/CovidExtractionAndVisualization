## Overview
Scrapping and processing functions for South Korea's COVID related data

### Prerequisite steps:
1. Create following container/s in Azure Blob Storage created to save covid data
    1. kor-1
    2. kor-2
    3. kor-3
    4. kor-4
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
            "SOURCE_URL_BUSAN": "http://english.busan.go.kr/bsnews01/1418806",
            "SOURCE_URL_DAEGU": "http://www.daegu.go.kr/dgcontent/index.do?menu_id=00936598&menu_link=/icms/bbs/selectBoardList.do&bbsId=BBS_02092",
            "SOURCE_URL_SEOUL": "http://www.seoul.go.kr/coronaV/coronaStatus.do",
            "AZURE_STORAGE_CONNECTION_STRING": "<connection string>",
            "whocovidstorage_STORAGE": "<connection string>",
            "SQLUsername": "<sql username>",
            "SQLPassword": "<sql password>",
            "TranslatorURL": "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=ko&to=en",
            "TranslatorAPIKey": "<api-key>"
        }
    }
    ```
    - **AzureWebJobsStorage**: Connection String of Storage Account configured when creating Azure Function App
    - **AZURE_STORAGE_CONNECTION_STRING**: Connection String of Storage Account where the covid data will be saved
    - **whocovidstorage_STORAGE**: Connection String of Storage Account where the covid data will be saved
    - **SQLUsername**: Username for SQL Database
    - **SQLPassword**: Password for SQL Database
    - **TranslatorAPIKey**: API Key from the Azure Translator Cognitive Service

2. Follow [this](https://docs.microsoft.com/en-us/azure/javascript/tutorial-vscode-serverless-node-03) to debug


### Steps to Deploy

2. Add all the values of **local.settings.json** file to **Configuration** in created Azure Function App.       
    > These values are treated as environment variables by Azure Function

5. Follow [these steps](https://docs.microsoft.com/en-us/azure/javascript/tutorial-vscode-serverless-node-04) to deploy the function to Azure