# Property Praxis

This application stack includes instructions for setting up a development and production environments for the Property Praxis app.

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

## Clone the repository

Create the directory to clone the repo

```
mkdir -p ~/propertypraxis && cd ~/propertypraxis
git clone <repo link>
```

## Run RStudio with PostGIS DB to populate DB

It is necessary to populate the Postgres DB with the data that will 
be consumeded by the application.

Run a detached environment.  If you haven't already built the images,
this command will also build them. Navigate to the root directory and run:

```
docker-compose up -d postgres rstudio
```

Load the initial PG DB by running this R script.

```
docker-compose exec rstudio Rscript /home/rstudio/pp-pipeline/scripts/s3-data-load.R
```

## Running a Dev Environment

To run this stack in development, navigate to the
root directory of the repo and run:

```
docker-compose up
```

or detach terminal with -d flag

```
docker-compose up -d
```

If you only want to run the web application without the RStudio service, run:

```
docker-compose up api web postgres
```

## Running a Production Environment

To run the full stack in production, navigate to the
root directory of the repo and run:

```
docker-compose -f docker-compose.yml -f docker-compose.production.yml up
```

or detach terminal with -d flag

```
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

Note that the above commands will start all the services.  You can also start only the 
web application services by running the command:

```
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d nginx api client postgres
```

## Include Required Environment Variables

In order to compose the dev and prod environments, you will need to include the following`.env` files in
the `./envs` directory:

- `api-prod.env`
- `api.env`
- `db.env`
- `rstudio.env`
- `client.env`

And in the `./rstudio/scripts/` directory include:

- `rstudio.env`

Contact the maintainer of this repository for required credentials.

## Stopping the Services

To stop the application, run

```
docker-compose down
```

## Connecting to the PostGIS Database

While running a dev or prod environment, you can connect to the PostGIS DB 
(assuming is it running) via the host terminal using the following command:

```
psql postgres://<username>:<databasepassword>@localhost:35432/db
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

There may also be an issue with node-sass bindings on install.
See these SO posts:
https://stackoverflow.com/questions/41942769/issue-to-node-sass-and-docker
https://stackoverflow.com/questions/37986800/node-sass-couldnt-find-a-binding-for-your-current-environment/55657576#55657576

If you get a an timed out error in `docker-compose up --build` run:

```
sudo service docker restart
export DOCKER_CLIENT_TIMEOUT=120
export COMPOSE_HTTP_TIMEOUT=120
```

https://stackoverflow.com/questions/42230536/docker-compose-up-times-out-with-unixhttpconnectionpool
