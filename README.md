# tru.ID OpenSSH Plugin

[![License][license-image]][license-url]

This repository is a demo application for integrating tru.ID's [PhoneCheck](https://developer.tru.id/docs/phone-check) as a multi-factor authentication step when using an OpenSSH server.

## Prerequisites

- A [tru.ID account](https://tru.id/).
- Create a [tru.ID project](https://developer.tru.id/console), and save the `tru.json` in the root directory of this repository.
- A mobile phone with a SIM card that has an active mobile data connection.
- [Docker](https://www.docker.com/), or a server to install this on.

## Docker

This example makes use of a Docker container for development purposes. 

```bash
docker build -t tru-ID/tru-id-ssh-auth:1.0 .
docker run -d -p 223:22 tru-ID/tru-id-ssh-auth:1.0
docker ps -a 
# copy the CONTAINER ID from the previous command, and replace `<CONTAINER_ID>` with this value
docker exec -it <CONTAINER_ID> /bin/bash
```

## Install

Change to the destination directory. For this, the default directory is `/root/tru-id-ssh-auth/`.

```bash
cd /root/tru-id-ssh-auth/
./ssh-auth install
```

## Register a user

```bash
./ssh-auth register-user <user> <phone number, including country code>
# For example: ./ssh-auth register-user test 44700000000
```

## Login Attempt

In a new Terminal instance, run the following command to SSH into your SSH server:

```bash
ssh test@127.0.0.1 -p 223
```

This example uses the username `test` and the password `test`.

## Uninstall

```bash
./ssh-auth uninstall
```

## Meta

Distributed under the MIT license. See `LICENSE` for more information.

[https://github.com/tru-ID](https://github.com/tru-ID)

[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: LICENSE