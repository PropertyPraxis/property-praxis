# Property Praxis Application Stack
This application stack includes instructions for setting up a development
environment for the Property Praxis app (still in development). 

### Install Docker

Install Docker (from https://docs.docker.com/install/linux/docker-ce/ubuntu/#set-up-the-repository)

#### Setup the Repo

1. Update the apt package index:
```
sudo apt-get update
```

2. Install packages to allow apt to use a repository over HTTPS:
```
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
```

3. Add Docker’s official GPG key:
```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

Verify that you now have the key with the fingerprint `9DC8 5822 9FC7 DD38 854A E2D8 8D81 803C 0EBF CD88`, 
by searching for the last 8 characters of the fingerprint.
```
sudo apt-key fingerprint 0EBFCD88
```

4. Use the following command to set up the stable repository
```
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
```

#### Install Docker Engine -Community

1. Update the apt package index.
```
sudo apt-get update
```

2. Install the latest version of Docker Engine - Community and containerd
```
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

4. Verify that Docker Engine - Community is installed correctly by running the `hello-world` image.
```
sudo docker run hello-world
```

#### Install Docker Compose

Manually install Docker Compose (from https://docs.docker.com/compose/install/#install-compose)

1. Run this command to download the current stable release of Docker Compose:
```
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

2. Apply executable permissions to the binary:
```
sudo chmod +x /usr/local/bin/docker-compose
```

3. Test the intallation
```
docker-compose --version
```

#### Run Docker without Sudo 

1. Create the `docker` group
```
sudo groupadd docker
```

2. Add your user to the `docker` group
```
sudo usermod -aG docker $USER
```

3. On Linux, you can also run the following command to activate the changes to groups:
```
newgrp docker
```

4. Verify that you can run `docker` commands without `sudo`.
```
docker run hello-world
```

#### Start on Boot

Follow these instructions so that Docker and its services start automatically on boot.
(from https://docs.docker.com/install/linux/linux-postinstall/#configure-docker-to-start-on-boot)

1. systemd
```
sudo systemctl enable docker
```
To disable this behavior, use disable instead.
```
sudo systemctl disable docker
```

## Clone Repo and Build App

Make a new directory and clone this repo.
```
mkdir property-praxis && cd property-praxis
git clone <repo link>
```

To run this stack in development, navigate to the 
root directory of the repo and run:
```
docker-compose up --build
docker-compose up
```
or close active terminal with -d flag
```
docker-compose up -d
```

## Troubleshooting
There may be a case where node modules are not installed in a container due to data volumes.
See this SO post:
https://stackoverflow.com/questions/30043872/docker-compose-node-modules-not-present-in-a-volume-after-npm-install-succeeds#comment63254549_32785014

You can fix this by either installing directly in the container when package.json changes or
by running this command:
```
docker-compose rm
docker-compose up --build
```

# Addtional Unfinished Instructions are below.  
To connect to the database from host terminal
```
psql postgres://<username>:<databasepassword>@localhost:35432/db
```

If you get a an timed out error in docker-compose up --build run
```
sudo service docker restart
```

To run the front-end build in Nginx, naigate to the 
client directory and run:
(you will not see any output)
```
docker build .
docker run -p 8080:80 \<containerid\>
```
 ## Build the RStudio Docker Image

Create the directory to clone the repo
```
mkdir -p ~/propertypraxis && cd ~/propertypraxis
git clone https://github.com/timhitchins/property-praxis-data-pipeline.git
```

After installing and cloning the repo, build the image.
Remember to set your password
```
cd ~/propertypraxis/pp-pipeline
docker build -t timhitchins/rstudio-property-praxis .
docker run -e PASSWORD=rstudiotesting --rm -p 8787:8787 \
    -v ${PWD}/data:${HOME}/pp-pipeline/data \
    -v ${PWD}/scripts:${HOME}/pp-pipeline/scripts \
    timhitchins/rstudio-property-praxis 
```