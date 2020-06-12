## Overview
A React based web application built as Search Service for COVID data

### Prerequisites:
> Azure Web App with NodeJS runtime stack
1. In Azure portal, go to **Create a resource>Web>Web App**
2. Fill in the details. Select *NodeJS* for *Runtime Stack*
3. Click *Review + create* and then *Create*

### Steps to deploy UI to azure:

1. Install all dependencies: `npm install`

2. Update following values in *services/azureSearchService.ts*:
    - **serviceName**: Azure Search Service Name
    - **indexName**: Azure Search Index Name
    - **apiKey**: Azure Search API Key

3. Build the application: `npm run build`

4. Go to *Deployment Center* in previously created Azure Web App > Click on *Deployment Credentials* and note down following values:
    1. Git Clone URL
    2. Username
    3. Password

5. Go into build folder and follow these steps:
    1. Initialize Git repo: `git init`
    2. Add the files to git: `git add`
    3. Commit the changes: `git commit -m "<Deployment Message>"`
    4. Add the git remote url: `git remote add azure <git clone url from prev step>`
    5. Push to files to remote: `git push azure master -f`
    6. Enter Username and Password from prev step

6. Go to Azure Web App and click on *Browse* to access the application