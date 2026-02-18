# Professional OSINT Investigation Framework v1.5 
## General
__OSINT minimal Version ***v1.5***. In This Version Focuse on Project Manimuplation by using 
Dashboard, Scan, Projects, Reports add assets remove other and do sample Threat Detection, using differenti
Modules like ***Job Recruitment, Linkin Investigation, Social Media OSINT, Scan Website Analysis
Email Leak Check, Scan Email Analysis***, PhoneNumber Osint Crypto Wallet Tracker___
- workflow
  > after register/login
  > create project with assets can be added in  initial creation or later after creation
  > go scan and choose the workspace project project Selecte target option
  > choose Invetigation mode if you want to use full module or specific custome scan
  > the invetigation has auto detection for the assets type with and analyse 

- [notes](https://github.com/weekevy/osintSaas/blob/main/notes): This file is for discussing what we are going to do in this project.
- [structure](https://github.com/weekevy/osintSaas/blob/main/structure): This file contains the structure of the entire project.
- [todo](https://github.com/weekevy/osintSaas/blob/main/todo): This file contains the to-do list (tasks).
## Run the web app locally
- by following those command you can make a fork to commit in same repo
```bash
  git clone git@github.com:weekevy/osintSaas.git && cd osintSaas
  # this is the install Dependencies (root, client, server)
  npm run install-all
  # Start the databse (Docker required) 
  docker-compose up -d 
  # Launch the full application

```
## docker
### Database
- MariaDB	    Main database	          3306	
- phpMyAdmin	Visual database manager	  8080	
```bash
  docker ps             # check what container running 
  docker-compose down   # Stop database
  docker-compose up -d  # start database
  docker logs           # view databse logs
```
## Authentication System
* '/api/register'       POST   Greate new account
* '/api/login'          POST   Sign in Existing user
* '/api/check-auth'     GET    Verify current version
* '/api/logout'         POST   Sign out user

## Used Dependencies
### /client - React
```json
"dependencies": {
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.5.0",
    "@tailwindcss/vite": "^4.1.18",
    "cookie": "^1.1.1",
    "framer-motion": "^12.34.0",
    "jsonwebtoken": "^9.0.3",
    "maath": "^0.10.8",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0",
    "tailwindcss": "^4.1.18",
    "three": "^0.182.0"
  }
```
### /server - NextJS
```json
"dependencies": {
    "next": "14.0.4",
    "react": "^18",
    "react-dom": "^18",
    "mysql2": "^3.6.5",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cookie": "^0.6.0"
  }
```





