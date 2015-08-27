'use strict';

var Q = require('q');
var assert = require('assert');
var AWS = require('aws-sdk');

var bucketName = process.env.CLOUDBUCKET_NAME;

assert(bucketName, 'please set environment variable CLOUDBUCKET_NAME');

var proxyUrl = process.env['https_proxy'] || process.env['http_proxy'];

if (proxyUrl) {
  var proxy = require('proxy-agent');
  AWS.config.update({
    httpOptions: {agent: proxy(proxyUrl)}
  });
}

var s3 = new AWS.S3({region: 'eu-west-1'});

exports.seed = function () {
  s3.listBuckets(function (err, data) {
    if (err) {
      console.log('Error:', err);
    }
    else {
      var defaultBucket = data.Buckets.filter(function (bucket) {
        return bucket.Name === bucketName;
      });
      if (!defaultBucket.length) {
        console.log('Creating default bucket');
        s3.createBucket({Bucket: bucketName}, function (err) {
          if (err) {
            console.log(err);
          }
          else {
            console.log('Successfully created default bucket');
          }
        });
      }
    }
  });
};

exports.upload = function (input, key, filename, contentType) {
  var params = {Key: key, Body: input, ContentType: contentType, Bucket: bucketName, Metadata: {filename: filename}};
  var upload = s3.upload(params);
  return Q.ninvoke(upload, 'send');
};

exports.getObject = function (key) {
  var params = {Key: key, Bucket: bucketName};
  return Q.ninvoke(s3, 'getObject', params);
};

exports.deleteObject = function (key) {
  var params = {Key: key, Bucket: bucketName};
  return Q.ninvoke(s3, 'deleteObject', params);
};
