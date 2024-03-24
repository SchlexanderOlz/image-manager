FROM node:alpine AS base

WORKDIR /usr/src/image-manager
ARG SRC_DIR=.


COPY $SRC_DIR /usr/src/image-manager
RUN npm i 

