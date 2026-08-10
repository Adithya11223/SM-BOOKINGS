#!/bin/bash
cd ~/Developer/SM_SALOON/salon-booking-backend
export MAVEN_OPTS="--sun-misc-unsafe-memory-access=allow"
mvn clean spring-boot:run > ~/Developer/SM_SALOON/backend_error.log 2>&1
echo "Finished running. Check backend_error.log"
