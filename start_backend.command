#!/bin/bash
export JAVA_HOME="/Users/adithya/Developer/SM_SALOON/salon-booking-backend/.jdk21/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
cd ~/Developer/SM_SALOON/salon-booking-backend
mvn clean spring-boot:run
