FROM ubuntu:latest

RUN apt update && apt install -y \
    software-properties-common
RUN apt install vim -y
RUN apt install curl -y
RUN apt install openssh-server -y
RUN apt install jq -y

RUN apt-get update && apt-get install -y \
    python3.4 \
    python3-pip

RUN pip install qrcode[pil]

RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 test 

RUN  echo 'test:test' | chpasswd

CMD ["/usr/sbin/sshd","-D"]

ADD . /root/tru-id-ssh-auth

COPY sshd_config /etc/ssh/sshd_config

RUN service ssh start

EXPOSE 22