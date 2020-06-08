## Prerequisites
1. [Node & NPM](https://nodejs.org/en/download/)
2. [Visual Studio Code](https://code.visualstudio.com/download)
3. [Azure Function Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) in Visual Studio Code

## Steps to deploy a function

1. Create [Azure Function App](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-function-app-portal)
    >Note: Create Separate Azure Function App for each country
    - In **Hosting** section select Azure Storage Account created to save Azure Function Apps' data

2. Deploy any of the following function by following steps for that specific function:
    1. [who-hongkong](who-hongkong)
    2. [who-japan](who-japan)
    3. [who-newzealand](who-newzealand)
    4. [who-philippines](who-philippines)
    5. [who-singapore](who-singapore)
    6. [who-southkorea](who-southkorea)


For more information on Azure Functions [click here](https://docs.microsoft.com/en-us/azure/azure-functions/).