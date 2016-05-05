#!/usr/bin/env python
import requests
import json
import sys
import argparse
import time
from pprint import pprint

parser = argparse.ArgumentParser('Queries Monorail to get the services and deployNotes where a list of Pull requests will be deployed')
parser.add_argument('--monorail', help='URL where Monorail is located', required=True)
parser.add_argument('--pullrequests', help='Comma or space separated list of pull requests we will ask for', required=True)
parser.add_argument('--tag', help='Tag associated to the deployment', required=True)
parser.add_argument('--statics', help='Statics version associated to the deployment', required=True)
parser.add_argument('--jenkinsURL', help='URL where Jenkins is located. Defaults to HTTPS if protocol is not entered!', required=True)
parser.add_argument('--jenkinsJob', help='Jenkins job that will be triggered', required=True)
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
    print 'We need the Tag associated to the deployment'
    exit(1)

if (args.statics):
    staticsVersion = args.statics
else:
    print 'We need the Statics version associated to the deployment'
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
polling_delay = 15 #seconds

for batch_same_node_version in services:
    payload = {}
    payload['token'] = args.jenkinsJobToken
    payload['cause'] = 'Build triggered with love by Monorail'
    payload['branch'] = tagVersion
    payload['grunt'] = str(batch_same_node_version['grunt']).lower()
    payload['node_version'] = batch_same_node_version['nodeVersion']

    statics = batch_same_node_version['statics']
    if statics:
        payload['static_files_version'] = staticsVersion

    services_list = set()
    for service in batch_same_node_version['deploy']:
        services_list.add(service)
    payload['where_to_deploy'] = list(services_list)

    try:
        r = requests.post(request_jenkins, auth=(args.jenkinsUser, args.jenkinsApiToken), params=payload)
        poll_url = r.headers.get('location')
    except:
        print 'There was an error triggering the build in Jenkins'
        exit(3)

    build_url = ''
    while (build_url == ''):
        try:
            r_poll = requests.get(poll_url + 'api/json', auth=(args.jenkinsUser, args.jenkinsApiToken))
            r_poll_data = r_poll.json()
        except:
            print 'There was an error querying Jenkins about the status of the build'
            exit(4)

        try:
            build_url = r_poll_data['executable']['url']
        except:
            print r_poll_data['why']
        time.sleep(polling_delay)

    building = True
    while (building != False):
        try:
            r_build = requests.get(build_url + 'api/json', auth=(args.jenkinsUser, args.jenkinsApiToken))
            r_build_data = r_build.json()
            building = r_build_data['building']
            print "%s: Still building" % r_build_data['fullDisplayName']
        except:
            print 'There was an error querying Jenkins about the status of the build'
            exit(4)
        time.sleep(polling_delay)

    print "%s: %s" % (r_build_data['fullDisplayName'], r_build_data['result'])
    if (r_build_data['result'] == "FAILURE"):
        exit (5)

exit (0)
