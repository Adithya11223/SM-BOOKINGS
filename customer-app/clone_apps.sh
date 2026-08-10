#!/bin/bash

# Navigate to root
cd /Users/adithya/Developer/SM_SALOON

echo "Creating customer-app..."
mkdir customer-app
# Copy everything except the new folders, backend, node_modules, and git
rsync -av --exclude 'customer-app' \
          --exclude 'admin-app' \
          --exclude 'salon-booking-backend' \
          --exclude 'node_modules' \
          --exclude '.git' \
          --exclude '.expo' \
          --exclude 'scratch' \
          --exclude 'init_apps.sh' \
          ./ customer-app/

echo "Creating admin-app..."
mkdir admin-app
rsync -av --exclude 'customer-app' \
          --exclude 'admin-app' \
          --exclude 'salon-booking-backend' \
          --exclude 'node_modules' \
          --exclude '.git' \
          --exclude '.expo' \
          --exclude 'scratch' \
          --exclude 'init_apps.sh' \
          ./ admin-app/

echo "Done cloning apps!"
