# Professional OSINT Investigation Framework v1
## Overview
OSINTSaaS is a comprehensive OSINT investigation framework designed for security professionals, 
researchers, and investigators. The platform streamlines threat detection and digital forensics 
through an integrated modular architecture, providing a unified workspace for managing complex 
investigations across multiple data sources.

### Basic Workflow

1. **Register/Login** - Create an account or sign in to access the platform
2. **Select Module** - Choose from various investigation modules based on your target
3. **Add Assets** - Input the assets (URLs, emails, phone numbers, etc.) you want to investigate
4. **Initiate Scan** - Click on the target module to start the scanning process
5. **Review Results** - View and analyze findings in the interactive dashboard
## Run the web app locally

```bash
  git clone git@github.com:weekevy/osintSaas.git && cd osintSaas
  npm run install-all
  docker-compose up --build  
  npm run dev
```
## docker
### Database 
- MariaDB	    Main database	          3306	
- phpMyAdmin	Visual database manager	  8080	
### Investigation Modules
- job-recuitment
- linkend-investivation

## Notes
- [notes](https://github.com/weekevy/osintSaas/blob/main/notes): This file is for discussing what we are going to do in this project.
- [structure](https://github.com/weekevy/osintSaas/blob/main/structure): This file contains the structure of the entire project.
- [todo](https://github.com/weekevy/osintSaas/blob/main/todo): This file contains the to-do list (tasks).

