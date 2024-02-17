#!/bin/bash

docker run -it --network=host -e NGROK_AUTHTOKEN=$NGROK ngrok/ngrok http 3000
