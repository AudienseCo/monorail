#!/usr/bin/env python
import requests
import json
import sys
import argparse

parser = argparse.ArgumentParser('Queries Monorail to get the services and deployNotes where a list of Pull requests will be deployed')
parser.add_argument('--monorail', help='URL where Monorail is located')
parser.add_argument('--pullrequests', help='Comma or space separated list of pull requests we will ask for')
parser.add_argument('--showServices', help='Prints the services related to the pullrequests', action='store_true')
args = parser.parse_args()

curl_uri = '/deploy-info?pr='

if (args.monorail):
    if args.monorail.startswith('http'):
        request_url = args.monorail+curl_uri
    else:
        request_url = 'http://'+args.monorail+curl_uri
else:
    print 'We need an URL'
    exit(1)

if (args.pullrequests):
    pull_requests = args.pullrequests.split()
    pull_requests = ",".join(pull_requests)
else:
    print 'A list of PRs is needed'
    exit(1)

try:
    r = requests.get(request_url+pull_requests)
except:
    print 'Something went wrong querying Monorail'
    exit(2)

data = r.json()
deployNotes = data['deployNotes']
services = data['services']

if (args.showServices):
    for batch_same_node_version in services:
        services_list = set()
        for service in batch_same_node_version['deploy']:
            services_list.add(service)
        print "Node version: %s" % batch_same_node_version['nodeVersion']
        print "Services: %s" % ', '.join(services_list)

if deployNotes == True:
    print 'There are deployNotes so we cannot continue'
    exit(3)

if len(services) == 0:
    print 'There are not services defined so we cannot continue'
    exit(4)

exit (0)
