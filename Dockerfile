FROM ubuntu:latest

RUN apt update && apt install -y \
    software-properties-common
RUN apt install vim -y sudo
RUN apt install curl -y sudo
RUN apt install qrencode -y sudo
RUN apt install openssh-server sudo -y
RUN apt install jq -y sudo

RUN apt-get update && apt-get install -y \
    python3.4 \
    python3-pip

RUN pip install qrcode[pil]

RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 test 

RUN  echo 'test:test' | chpasswd

ADD . /root/tru-id-ssh-auth

CMD ["/usr/sbin/sshd","-D"]

COPY sshd_config /etc/ssh/sshd_config

RUN service ssh start

EXPOSE 22