# Professional OSINT Investigation Framework v1 
<p align="center">
  <img src="./client/src/assets/images/second.png" alt="Logo" width="300"/>
</p>

## General
__OSINT Version ***v1***. In This we Version Focusd on Integrated Modules management if you are 
familiar with the previouse version it contain the project item as the main working env, by create
new project and add different type of assets randomly, instead in this release you can directly
add items of a specific module such as Job req, you can easly add the needed assets and this will
make this version more better easy and efficient and avoid false positive.
Dashboard, Scan, Reports add remove assets and Threat Detection, using Various
Module types***Job Recruitment, Linkin Investigation, Social Media OSINT, Scan Website Analysis
Email Leak Check, Scan Email Analysis***, PhoneNumber Osint Crypto Wallet Tracker___
- workflow Basic (initial)
  >  - after register/login
  >  - you can directly access to a specific module and add ur assets that you will scan
  >  - click on traget Module
  >  - Fill up any assets you need then click scan
  >  - all the result will be showed up in the same page in fancy design 


> [!IMPORTANT]
> - [notes](https://github.com/weekevy/osintSaas/blob/main/notes): This file is for discussing what we are going to do in this project.
> - [structure](https://github.com/weekevy/osintSaas/blob/main/structure): This file contains the structure of the entire project.
> - [todo](https://github.com/weekevy/osintSaas/blob/main/todo): This file contains the to-do list (tasks).

## Notes
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
