'use scrict';

const should = require('should');
const { cloneDeep } = require('lodash');

const createGetConfig = require('../../../core/services/getConfig');
const repoConfigFixture = require('../../fixtures/repoConfig.json');

describe('getConfig service', () => {
  it('should return an error if fails retrieving the repo config', (done) => {
    const getConfig = createGetConfigWithStubs(new Error('dummy error'));
    const repo = '123';
    getConfig(repo, (err) => {
      should.exist(err);
      done();
    });
  });

  context('combine repo github settings with the local config', () => {
    it('empty local config', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.github = {
        "user": 'AudienseCo',
        "repos": ['monorail-tests'],
        "token": "token",
        "masterBranch": "master",
        "devBranch": "dev",
        "deployedLabel": "deployed",
        "deployNotesLabel": "deploy notes",
      };
      const localConfig = getLocalConfig();
      localConfig.github = {};
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err, config) => {
        should.not.exist(err);
        config.github.should.be.eql(repoConfig.github);
        done();
      });
    });

    it('empty repo config', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.github = {};
      const localConfig = getLocalConfig();
      localConfig.github = {
        "user": 'AudienseCo',
        "repos": ['monorail-tests'],
        "token": "token",
        "masterBranch": "master",
        "devBranch": "dev",
        "deployedLabel": "deployed",
        "deployNotesLabel": "deploy notes"
      };
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err, config) => {
        should.not.exist(err);
        config.github.should.be.eql(localConfig.github);
        done();
      });
    });

    it('incomplete settings in each config', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.github = {
        "deployedLabel": "deployed",
        "deployNotesLabel": "deploy notes"
      };
      const localConfig = getLocalConfig();
      localConfig.github = {
        "user": 'AudienseCo',
        "repos": ['monorail-tests'],
        "token": "token",
        "masterBranch": "master",
        "devBranch": "dev"
      };
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err, config) => {
        should.not.exist(err);
        config.github.should.be.eql({
          "user": 'AudienseCo',
          "repos": ['monorail-tests'],
          "token": "token",
          "masterBranch": "master",
          "devBranch": "dev",
          "deployedLabel": "deployed",
          "deployNotesLabel": "deploy notes"
        });
        done();
      });
    });

    it('incomplete settings after combination should fail', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.github = {
        "deployedLabel": "deployed"
      };
      const localConfig = getLocalConfig();
      localConfig.github = {
        "devBranch": "dev"
      };
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err) => {
        should.exist(err);
        done();
      });
    });

  });

  context('combine repo deploy ciServices settings with the local config', () => {
    it('should combine configs', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.deploy.ciServices = {
        "jenkins_deploy": {
          "driver": "jenkins",
          "settings": {
            "url": "url",
            "pollingInterval": 1000
          }
        },
        "another_repo_service": {
          "driver": "jenkins",
          "settings": {
            "url": "url",
            "pollingInterval": 1000
          }
        }
      };
      repoConfig.deploy.services = {
        "globalreports": {
          "ciJob": "nodejs v8.6.0",
          "deployTo": [
            "globalreports-as"
          ]
        }
      };
      const localConfig = getLocalConfig();
      localConfig.deploy.ciServices = {
        "jenkins_deploy": {
          "driver": "jenkins",
          "settings": {
            "url": "url_local",
            "username": "local_username",
            "password": "local_password",
            "pollingInterval": 1000
          }
        },
        "another_local_service": {
          "driver": "jenkins",
          "settings": {
            "url": "url_local",
            "username": "local_username",
            "password": "local_password",
            "pollingInterval": 1000
          }
        }
      };
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err, config) => {
        should.not.exist(err);
        config.deploy.ciServices.should.be.eql({
          "jenkins_deploy": {
            "driver": "jenkins",
            "settings": {
              "url": "url",
              "username": "local_username",
              "password": "local_password",
              "pollingInterval": 1000
            }
          },
          "another_repo_service": {
            "driver": "jenkins",
            "settings": {
              "url": "url",
              "pollingInterval": 1000
            }
          },
          "another_local_service": {
            "driver": "jenkins",
            "settings": {
              "url": "url_local",
              "username": "local_username",
              "password": "local_password",
              "pollingInterval": 1000
            }
          }
        });
        done();
      });
    });

    it('incomplete settings after combination should fail', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.deploy.ciServices = {
        "jenkins_deploy": {
          "driver": "jenkins"
        }
      };
      const localConfig = getLocalConfig();
      localConfig.deploy.ciServices = {};
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err, config) => {
        should.exist(err);
        done();
      });
    });

    it('empty ciServices settings after combination should fail', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.deploy.ciServices = {};
      const localConfig = getLocalConfig();
      localConfig.deploy.ciServices = {};
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err, config) => {
        should.exist(err);
        done();
      });
    });

    it('should fail if there is no driver available', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      const localConfig = getLocalConfig();
      const ciDrivers = {};
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig, ciDrivers);

      const repo = '123';
      getConfig(repo, (err, config) => {
        should.exist(err);
        done();
      });
    });

  });

  context('combine repo deploy ciJobs settings with the local config', () => {
    it('should combine configs', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.deploy.ciJobs = {
        "nodejs v8.6.0": {
          "ciService": "jenkins_deploy",
          "jobName": "monorail-tarball-ecs",
          "servicesParam": {
            "paramName": "where_to_deploy",
            "separator": ","
          },
          "sourceVersionParam": {
            "paramName": "branch"
          },
          "defaultParams": {
            "token": "job token",
            "branch": "dev",
            "node_version": "v8.6.0",
            "grunt": false,
            "static_files_version": "",
            "statics": false
          }
        }
      };
      repoConfig.deploy.services = {
        "globalreports": {
          "ciJob": "nodejs v8.6.0",
          "deployTo": [
            "globalreports-as"
          ]
        }
      };
      const localConfig = getLocalConfig();
      localConfig.deploy.ciJobs = {
        "nodejs v8.6.0": {
          "ciService": "jenkins_deploy",
          "jobName": "monorail-tarball-ecs",
          "servicesParam": {
            "paramName": "where_to_deploy",
            "separator": ","
          }
        }
      };
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err, config) => {
        should.not.exist(err);
        config.deploy.ciJobs.should.be.eql(repoConfig.deploy.ciJobs);
        done();
      });
    });

    it('incomplete settings after combination should fail', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.deploy.ciJobs = {
        "nodejs v8.6.0": {
          "ciService": "jenkins_deploy",
        }
      };
      const localConfig = getLocalConfig();
      localConfig.deploy.ciJobs = {};
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err) => {
        should.exist(err);
        done();
      });
    });

    it('empty ciJobs settings after combination should fail', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.deploy.ciJobs = {};
      const localConfig = getLocalConfig();
      localConfig.deploy.ciJobs = {};
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err) => {
        should.exist(err);
        done();
      });
    });

    it('should fail if there is no ciService available for the ciJob', (done) => {
      const repoConfig = cloneDeep(repoConfigFixture);
      repoConfig.deploy.ciJobs['nodejs v8.6.0'].ciService = 'another service';
      const localConfig = getLocalConfig();
      localConfig.deploy.ciJobs = {};
      const getConfig = createGetConfigWithStubs(null, repoConfig, localConfig);

      const repo = '123';
      getConfig(repo, (err) => {
        should.exist(err);
        done();
      });
    });

  });

  function getLocalConfig() {
    return {
      "github": {
        "user": 'AudienseCo',
        "repos": ['monorail-tests'],
        "token": "token",
        "masterBranch": "master",
        "devBranch": "dev",
        "deployedLabel": "deployed",
        "deployNotesLabel": "deploy notes",
      },
      "deploy": {
        "ciServices": {}
      }
    };
  }

  function createGetConfigWithStubs(err, repoConfig, localConfig, ciDrivers) {
    const getRepoConfigDummy = (repo, cb) => cb(err, repoConfig || {});
    const defaultCIDrivers = {
      jenkins: {}
    };
    return createGetConfig(getRepoConfigDummy, localConfig || {}, ciDrivers || defaultCIDrivers);
  }
});
