## Overview
Scrapping and processing functions for Japan's COVID related data

### Prerequisites
> NodeJS and NPM

> Visual Studio Code

### Steps to Debug locally:
1. Create **local.settings.json** file with following values:
    - **AzureWebJobsStorage**: Connection String of Storage Account configured when creating Azure Function App
    - **AZURE_STORAGE_CONNECTION_STRING**: Connection String of Storage Account where the covid data will be saved
    - **whocovidstorage_STORAGE**: Connection String of Storage Account where the covid data will be saved
    - **SQLUsername**: Username for SQL Database
    - **SQLPassword**: Password for SQL Database

2. Follow [this](https://docs.microsoft.com/en-us/azure/javascript/tutorial-vscode-serverless-node-03)


### Steps to Deploy

1. Open this project in **Visual Studio Code**

2. Add all the values of **local.settings.json** file to **Configuration** in Azure Function. These values are treated as environment variables by Azure Function

3. Create container **jpn-1** in Blob Storage where covid data will be saved

4. Install [Azure Function Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) in Visual Studio Code

5. Follow [these steps](https://docs.microsoft.com/en-us/azure/javascript/tutorial-vscode-serverless-node-04) to deploy the function to Azure

>**Note**: *Azure Function App can also be created beforehand and it will show up in the Visual Studio Code while deploying the function*

For more information on Azure Functions [click here](https://docs.microsoft.com/en-us/azure/azure-functions/).