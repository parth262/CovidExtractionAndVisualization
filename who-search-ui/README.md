## Overview
A React based web application built as Search Service for COVID data

### Prerequisites:    
> Azure Web App with NodeJS runtime stack

### Steps to deploy UI to azure:

1. Install all dependencies: `npm install`

2. Build the application: `npm run build`

3. Go to *Deployment Center* in Azure Web App > Click on *Deployment Credentials* and note down following values:
    1. Git Clone URL
    2. Username
    3. Password

4. Go into build folder and follow these steps:
    1. Initialize Git repo: `git init`
    2. Add the files to git: `git add`
    3. Commit the changes: `git commit -m "<Deployment Msg>"`
    4. Add the git remote url: `git remote add azure <git clone url from prev step>`
    5. Push to files to remote: `git push azure master -f`
    6. Enter Username and Password from prev step

5. Go to Azure Web App and click on *Browse* to access the application