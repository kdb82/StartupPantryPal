#!/bin/bash

src_dir="."

while getopts k:h:s:d: flag
do
    case "${flag}" in
        k) key=${OPTARG};;
        h) hostname=${OPTARG};;
        s) service=${OPTARG};;
        d) src_dir=${OPTARG};;
    esac
done

if [[ -z "$key" || -z "$hostname" || -z "$service" ]]; then
    printf "\nMissing required parameter.\n"
    printf "  syntax: deployFiles.sh -k <pem key file> -h <hostname> -s <service> [-d <source dir>]\n\n"
    exit 1
fi

if [[ ! -d "$src_dir" ]]; then
    printf "\nSource directory does not exist: %s\n\n" "$src_dir"
    exit 1
fi

src_dir="${src_dir%/}"

printf "\n----> Deploying files for %s to %s with %s (source: %s)\n" "$service" "$hostname" "$key" "$src_dir"

# Step 1
printf "\n----> Clear out the previous distribution on the target.\n"
ssh -i "$key" ubuntu@$hostname << ENDSSH
rm -rf services/${service}/public
mkdir -p services/${service}/public
ENDSSH

# Step 2
printf "\n----> Copy the distribution package to the target.\n"
scp -r -i "$key" "$src_dir"/* ubuntu@$hostname:services/$service/public
