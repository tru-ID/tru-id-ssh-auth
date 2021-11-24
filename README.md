# tru.ID OpenSSH Plugin

[![License][license-image]][license-url]

This repository is a demo application for integrating tru.ID's [PhoneCheck](https://developer.tru.id/docs/phone-check) as a multi-factor authentication step when using an OpenSSH server.

## Prerequisites

- A [tru.ID account](https://tru.id/).
- Create a [tru.ID project](https://developer.tru.id/console), and save the `tru.json` in the root directory of this repository.
- A mobile phone with a SIM card that has an active mobile data connection.
- [Docker](https://www.docker.com/), or a server to install this on.

## Create a tru.ID account

To use this application you will need a [**tru.ID**](https://www.tru.id) account. To signup for one head over to the [signup page](https://tru.id/signup).

Then, in your **tru.ID** [console](https://developer.tru.id/console), navigate to the `Settings` page to create yourself some credentials for your Workspace. Be sure to save the file somewhere secure and make a note of the `client_id` and `client_secret` because this is needed later when setting up the **tru.ID** CLI.

> **Note** once you close this tab, you will no longer be able to retrieve this specific set of credentials in the **tru.ID** console.

## Create a tru.ID project

To create the **tru.ID** project, first install the **tru.ID** [CLI](https://github.com/tru-ID/tru-cli), by running the following command in your terminal:

```bash
npm install -g @tru_id/cli
```

You'll then need to enter your **tru.ID** credentials, which you can find in the [console](https://developer.tru.id/console). Once you've found your credentials, in your terminal, run the following command: 

```bash
tru setup:credentials {YOUR_CLIENT_ID} {YOUR_CLIENT_SECRET} EU
```

Now you'll need a project on **tru.ID**. So to create your project in your terminal run the following command (`ssh-auth-project` can be whatever name you wish):

```bash
tru projects:create ssh-auth-project
```

This will create a new directory `ssh-auth-project`, and within this directory will be a `tru.json` file containing all the information on your project. It also has your projects credentials so keep it safe.

## Clone this repository

Now clone the sample code of this GitHub repository. The main files in this repository are described below:

- `Dockerfile`, a configuration for a Docker container to use in this demo. You're more than welcome to install this on your own server though, just make sure you ignore the Docker instructions in this `README`.
- `ssh-auth`, the code that will be run when an SSH attempt is made. This also contains code to install the app to the server, and register users with their phone numbers linked to the account.
- `sshd_config`, a template ssh daemon config for use in this code sample.

To clone this repository in your terminal run the following command:

```bash
git clone git@github.com:tru-ID/tru-id-ssh-auth.git
```

## Add the credentials file

Copy the `tru.json` file into this new directory. If both directories created from the previous two steps are at the same level, then the following command would work:

```bash
cp ssh-auth-project/tru.json tru-id-ssh-auth/
```

## Docker

This example makes use of a Docker container for development purposes so, if you run the following commands in your Terminal to do the following:

- Build your Docker container with the tag `tru-id/tru-id-ssh-auth` and version 1.0.
- Run the docker container with the tag `tru-id/tru-id-ssh-auth`. This will also map the internal port `22` (ssh) to an externally accessible port `223`.
- Display all docker containers currently running
- Open the Docker container with a bash session.

So, in your terminal run the following four commands:

```bash
docker build -t tru-id/tru-id-ssh-auth:1.0 .
docker run -d -p 223:22 tru-id/tru-id-ssh-auth:1.0
docker ps -a 
# copy the CONTAINER ID from the previous command, and replace `<CONTAINER_ID>` with this value
docker exec -it <CONTAINER_ID> /bin/bash
```

## Install

With your Docker container built and running, in the same terminal instance, change to the project directory. For this, the default directory is `/root/tru-id-ssh-auth/`. Then run the command `./ssh-auth install` to install your copy your project directory over to `/usr/local/bin/`.

> **Note:** This is defined in your `Dockerfile` at the line: `ADD . /root/tru-id-ssh-auth`

```bash
cd /root/tru-id-ssh-auth/
./ssh-auth install
```

The command `./ssh-auth install` will do the following:

- Copy your project directory from `/root/tru-id-ssh-auth/` to `/usr/local/bin/tru-id-ssh-auth/`.
- Create a `/usr/local/bin/tru-id-ssh-auth/tru-id-ssh-auth.conf` config file.

## Register a user

With the plugin installed, you now need to enable the check for the user(s) . This stores the user's name and their phone number into your recently created config file. Which will then be compared to when the user attempts to log in. Still in the same terminal, run the following command, swapping out the placeholders for your valid details:

> **Note**: The Docker user and password are both `test`.

```bash
/usr/local/bin/tru-id-ssh-auth/ssh-auth register-user <username> <phone-number-inc-country-code>
# For example: /usr/local/bin/tru-id-ssh-auth/ssh-auth register-user test 447000000000
```

## Login Attempt

Everything has now been set up, so to check everything is working, open a new terminal session and run the following command to SSH into your SSH server:

```bash
ssh test@127.0.0.1 -p 223
```

The Docker config example uses the username `test` and the password `test`.

## Uninstall

If you wish to uninstall this plugin from your SSH server, when tunneled into the server, run the following command:

```bash
/usr/local/bin/tru-id-ssh-auth/ssh-auth uninstall
```

## Meta

Distributed under the MIT license. See `LICENSE` for more information.

[https://github.com/tru-ID](https://github.com/tru-ID)

[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: LICENSE