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
        DEST="$PWD"/dist
        CWD="$PWD"/work;
    fi
else
    if [ -f "$destF"/pack.toml ]; then
        printf "Can't use packwiz modpack directory.";
    else 
        DEST="$destF"/dist
        CWD="$destF"/work;
    fi
fi

mkdir -p dist
mkdir -p work
cd $modpF
packwiz mr export -o $CWD/cargocraft_mr.mrpack
cp $CWD/cargocraft_mr.mrpack $DEST
cd $CWD
unzip cargocraft_mr.mrpack
rm cargocraft_mr.mrpack
mv overrides minecraft
WORKDIR=$CWD/minecraft

req_str=$(jq -r '.files[].env.client | @sh' modrinth.index.json)
declare -a REQUIRED="($req_str)"

down_str=$(jq -r '.files[].path | @sh' modrinth.index.json)
declare -a DOWNLOAD_PATH="($down_str)"  

url_str=$(jq -r '.files[].downloads[0] | @sh' modrinth.index.json)
declare -a DOWNLOAD_URL="($url_str)"  

for i in "${!REQUIRED[@]}"; do
    printf $i
    printf "${REQUIRED[i]}"
    if [ "${REQUIRED[i]}" == required ]; then
        MODPATH=$WORKDIR/$(dirname "${DOWNLOAD_PATH[i]}")
        mkdir -p $MODPATH
        wget -U "Mods download script (via wget) t.me/humanised_doll github.com/DrugsNotIncluded/cargocraft" "${DOWNLOAD_URL[i]}" -P $MODPATH;
    fi
done

rm modrinth.index.json
zip -r cargocraft_generic.zip minecraft
mv cargocraft_generic.zip $DEST
rm -r ../work