#!/bin/bash
#apt-get install sshpass
echo "Starting Script..."

#INBOUND#
uuidInbound=$(uuidgen)
echo "Getting inbound..."
sshpass -p "datatronics1" ssh datatronics@80.28.51.171 sshpass -p "mclaw.." ssh mclaw@213.140.41.202 ssh bo cat "/var/opt/anritsu/mclaw/BO_reports/Inbound*.csv" > "reports/inbound_$uuidInbound.csv"

file=reports/inbound_$uuidInbound.csv

size=$( (du --apparent-size --block-size=1 "$file" 2>/dev/null || gdu --apparent-size --block-size=1 "$file" 2>/dev/null || find "$file" -printf "%s" 2>/dev/null || gfind "$file" -printf "%s" 2>/dev/null || stat --printf="%s" "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || wc -c <"$file" 2>/dev/null) | awk '{print $1}')

echo "Size of inbound file: $size"

if [ "$size" -gt "0" ]
then
	echo "Size! Continue to Remove files from server"
	sshpass -p "datatronics1" ssh datatronics@80.28.51.171 sshpass -p "mclaw.." ssh mclaw@213.140.41.202 ssh bo rm "/var/opt/anritsu/mclaw/BO_reports/Inbound*.csv"
else
    echo "No size... Remove local file"
    rm $file
fi

#OUTBOUND#

uuidOutbound=$(uuidgen)
echo "Getting outbound..."
sshpass -p "datatronics1" ssh datatronics@80.28.51.171 sshpass -p "mclaw.." ssh mclaw@213.140.41.202 ssh bo cat "/var/opt/anritsu/mclaw/BO_reports/Outbound*.csv" > "reports/outbound_$uuidOutbound.csv"

file=reports/outbound_$uuidOutbound.csv

size=$( (du --apparent-size --block-size=1 "$file" 2>/dev/null || gdu --apparent-size --block-size=1 "$file" 2>/dev/null || find "$file" -printf "%s" 2>/dev/null || gfind "$file" -printf "%s" 2>/dev/null || stat --printf="%s" "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || wc -c <"$file" 2>/dev/null) | awk '{print $1}')

echo "Size of outbound file: $size"

if [ "$size" -gt "0" ]
then
	echo "Size! Continue to Remove files from server"
	sshpass -p "datatronics1" ssh datatronics@80.28.51.171 sshpass -p "mclaw.." ssh mclaw@213.140.41.202 ssh bo rm "/var/opt/anritsu/mclaw/BO_reports/Outbound*.csv"
else
    echo "No size... Remove local file"
    rm $file
fi

echo "End script!"
exit 0