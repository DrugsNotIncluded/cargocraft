#!/bin/bash

set -o errexit -o pipefail -o noclobber -o nounset

getopt --test > /dev/null && true
if [[ $? -ne 4 ]]; then
    echo 'I’m sorry, `getopt --test` failed in this environment.'
    exit 1
fi

LONGOPTS=output:,destination:,help
OPTIONS=d:m:h

PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@") || exit 2
eval set -- "$PARSED"

destF="" modpF=""
while true; do
    case "$1" in
        -d|--destination)
            destF=$(realpath "$2")
            shift 2
            ;;
        -m|--modpack)
            modpF=$(realpath "$2")
            shift 2
            ;;
        -h|--help)
            printf "Usage: \n mkserver.sh \n   -d|--destination - Output folder. PWD by default \n   -m|--modpack - Server modpack folder."
            exit 0
            ;;
        --)
            shift
            break
            ;;
        *)
            echo "Programming error"
            exit 3
            ;;
    esac
done


if [ -z "$modpF" ]; then
    modpF=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
fi

if [ -z "$destF" ]; then
    printf "Missing destination parameter, using $PWD/dist as default\n";
    if [ -f "$PWD"/pack.toml ]; then
        printf "Can't use default path. Set destination folder by hand or move from packwiz modpack directory.";
    else
        CWD="$PWD"/work;
    fi
else
    if [ -f "$destF"/pack.toml ]; then
        printf "Can't use packwiz modpack directory.";
    else 
        CWD="$destF"/work;
    fi
fi

server_installer_url="https://maven.neoforged.net/releases/net/neoforged/forge/1.20.1-47.1.106/forge-1.20.1-47.1.106-installer.jar"

mkdir -p $CWD
cd $modpF && packwiz mr export -o $CWD/cargocraft.mrpack
wget "${server_installer_url}" -O $CWD/installer.jar
cd $CWD
java -jar installer.jar --install-server
mrpack-install --server-dir ./ --server-file libraries/net/neoforged/forge/1.20.1-47.1.106/forge-1.20.1-47.1.106-server.jar cargocraft.mrpack
rm cargocraft.mrpack
rm installer.jar
cd ..
mkdir -p dist
zip -r dist/server.zip $CWD
rm -r $CWD