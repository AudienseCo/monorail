#!/usr/bin/env python

import requests
import json
import sys
import argparse

parser = argparse.ArgumentParser('Queries Monorail to get the services and deployNotes where a list of Pull requests will be deployed')
parser.add_argument('--url', help='URL where Monorail is located')
parser.add_argument('--pr', help='List of pull requests we will ask for')
args = parser.parse_args()

curl_uri = '/deploy-info?pr='

if (args.url):
    if args.url.startswith('http'):
        request_url = args.url+curl_uri
    else:
        request_url = 'http://'+args.url+curl_uri
else:
    print 'We need an URL'
    exit(1)

if (args.pr):
    pull_requests = args.pr.split()
    pull_requests = ",".join(pull_requests)
else:
    print 'A list of PRs is needed'
    exit(1)

try:
    r = requests.get(request_url+pull_requests)
except:
    print 'Something went wrong querying Monorail'
    exit(2)

json_list = r.json()
services=json_list['services']
deploynotes=json_list['deployNotes']

print 'deploynotes:'
print deploynotes
print '\nservices:'
print services

if deploynotes == 'True':
    print 'There are deployNotes so we cannot continue'
    exit(3)

if len(services) == 0:
    print 'There are not services defined so we cannot continue'
    exit(4)

exit (0)
