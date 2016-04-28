#!/usr/bin/env python
import requests
import json
import sys
import argparse

parser = argparse.ArgumentParser('Queries Monorail to get the services and deployNotes where a list of Pull requests will be deployed')
parser.add_argument('--monorail', help='URL where Monorail is located')
parser.add_argument('--pullrequests', help='Comma or space separated list of pull requests we will ask for')
parser.add_argument('--tag', help='tag associated to the deployment')
parser.add_argument('--jenkinsURL', help='URL where Jenkins is located. Defaults to HTTPS if protocol is not entered!')
parser.add_argument('--jenkinsJob', help='Jenkins job that will be triggered')
parser.add_argument('--jenkinsUser', help='Jenkins user for authentication')
parser.add_argument('--jenkinsApiToken', help='Jenkins API token for authentication')
parser.add_argument('--jenkinsJobToken', help='Jenkins Job token for authentication')
args = parser.parse_args()

if (args.monorail):
    monorail_uri = '/deploy-info?pr='
    if args.monorail.startswith('http'):
        request_monorail = args.monorail+monorail_uri
    else:
        request_monorail = "http://%s%s" % (args.monorail, monorail_uri)
else:
    print 'We need an URL for Monorail'
    exit(1)

if (args.pullrequests):
    pull_requests = args.pullrequests.split()
    pull_requests = ",".join(pull_requests)
else:
    print 'A list of PRs is needed'
    exit(1)

if (args.tag):
    tagVersion = args.tag
else:
    print 'We need the tag associated to the deployment'
    exit(1)

if (args.jenkinsURL):
    jenkins_uri = "/view/All/job/%s/buildWithParameters" % args.jenkinsJob
else:
    print 'We need the job name that Jenkins will trigger'
    exit(1)

if (args.jenkinsURL):
    if args.jenkinsURL.startswith('http'):
        request_jenkins = args.jenkinsURL+jenkins_uri
    else:
        request_jenkins = "https://%s%s" % (args.jenkinsURL, jenkins_uri)
else:
    print 'We need an URL for Jenkins'
    exit(1)

try:
    r = requests.get(request_monorail+pull_requests)
except:
    print 'Something went wrong querying Monorail'
    exit(2)

data = r.json()
services = data['services']

for batch_same_node_version in services:
    payload = {}
    payload['token'] = args.jenkinsJobToken
    payload['cause'] = 'Build triggered with love by Monorail'
    payload['branch'] = tagVersion
    payload['grunt'] = batch_same_node_version['grunt']
    payload['node_version'] = batch_same_node_version['nodeVersion']

    statics = batch_same_node_version['statics']
    if statics:
        payload['static_files_version'] = tagVersion

    services_list = []
    for service in batch_same_node_version['deploy']:
        services_list.append(service)
    payload['where_to_deploy'] = services_list

    try:
        r = requests.post(request_jenkins, auth=(args.jenkinsUser, args.jenkinsApiToken), params=payload)
        print r.text
    except:
        print 'Something went wrong querying Jenkins'
        exit(3)

exit (0)
