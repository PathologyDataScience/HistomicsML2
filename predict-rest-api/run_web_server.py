"""
Redis web server of HistomicsML
"""

import settings
from flask import Flask, request, jsonify
import redis
import uuid
import json
from copy import copy

# initialize our flask application and redis server
app = Flask(__name__)

# initialize settings
s = settings.Settings()

db = redis.StrictRedis(host=s.REDIS_HOST, port=s.REDIS_PORT, db=s.REDIS_DB)


@app.route("/model")
def homepage():
	return "Main REST API!"


@app.route("/model/selectonly", methods=['POST'])
def selectonly():
	data = {"success": 'none'}
	uid = request.form['uid']
	target = request.form['target']
	iteration = request.form['iteration']
	dataset = request.form['dataset']
	pca = request.form['pca']

	# d = {"id": uid, "uid": uid, "target": target, "iteration": iteration, "dataset": dataset}
	d = dict(id=uid, uid=uid, target=target,
			 iteration=iteration, dataset=dataset,
			 pca=pca)

	db.rpush(s.REQUEST_QUEUE, json.dumps(d))

	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break

	db.flushdb()
	return jsonify(data)


@app.route("/model/save", methods=['POST'])
def save():
	data = {"success": 'none'}
	uid = request.form['uid']
	target = request.form['target']
	classifier = request.form['classifier']
	posclass = request.form['posclass']
	negclass = request.form['negclass']
	iteration = request.form['iteration']
	dataset = request.form['dataset']
	pca = request.form['pca']
	reloaded = request.form['reloaded']

	d = dict(id=uid, uid=uid, target=target,
			 classifier=classifier, reloaded=reloaded,
			 posclass=posclass, negclass=negclass,
			 iteration=iteration, dataset=dataset,
			 pca=pca)

	db.rpush(s.REQUEST_QUEUE, json.dumps(d))

	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break

	db.flushdb()
	return jsonify(data)


@app.route("/model/view", methods=['POST'])
def view():
	data = {"success": 'none'}
	d = json.loads(request.data)
	uid = d.get('uid')
	db.rpush(s.REQUEST_QUEUE, json.dumps(d))
	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break
	db.flushdb()
	return jsonify(data)


@app.route("/model/retrainView", methods=['POST'])
def retrainView():
	data_retrainview = {"success": 'none'}
	d = json.loads(request.data)
	uid = d.get('uid')
	db.rpush(s.REQUEST_QUEUE, json.dumps(d))

	while True:
		output = db.get(uid)
		if output is not None:
			data_retrainview = copy(output)
			db.delete(uid)
			break

	db.flushdb()
	return jsonify(data_retrainview)


@app.route("/model/retrainHeatmap", methods=['POST'])
def retrainHeatmap():
	data_retrainheatmap = {"success": 'none'}
	d = json.loads(request.data)
	uid = d.get('uid')
	db.rpush(s.REQUEST_QUEUE, json.dumps(d))

	while True:
		output = db.get(uid)
		if output is not None:
			data_retrainheatmap = copy(output)
			db.delete(uid)
			break

	db.flushdb()
	return jsonify(data_retrainheatmap)



@app.route("/model/reload", methods=['POST'])
def reload():
	data = {"success": 'fail'}
	uid = request.form['uid']
	target = request.form['target']
	dataset = request.form['dataset']
	pca = request.form['pca']
	trainingSetName = request.form['trainingSetName']
	d = dict(id=uid, uid=uid, target=target,
			 trainingSetName=trainingSetName, dataset=dataset,
			 pca=pca)

	db.rpush(s.REQUEST_QUEUE, json.dumps(d))
	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break

	db.flushdb()
	return jsonify(data)


@app.route("/model/train", methods=['POST'])
def train():
	data = {"success": 'none'}
	d = json.loads(request.data)
	uid = d.get('uid')
	db.rpush(s.REQUEST_QUEUE, json.dumps(d))
	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			db.delete(uid)
			break
	db.flushdb()
	return jsonify(data)

@app.route("/model/heatmap", methods=['POST'])
def heatmap():
	data = {"success": 'none'}
	d = json.loads(request.data)
	uid = d.get('uid')
	db.rpush(s.REQUEST_QUEUE, json.dumps(d))

	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break

	db.flushdb()
	return jsonify(data)


@app.route("/model/heatmapAll", methods=['POST'])
def heatmapAll():
	data = {"success": 'none'}
	d = json.loads(request.data)
	uid = d.get('uid')
	db.rpush(s.REQUEST_QUEUE, json.dumps(d))

	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break

	db.flushdb()
	return jsonify(data)


@app.route("/model/review", methods=['POST'])
def review():
	data = {"success": 'none'}
	uid = request.form['uid']
	target = request.form['target']
	dataset = request.form['dataset']
	pca = request.form['pca']

	d = dict(id=uid, uid=uid, target=target, dataset=dataset, pca=pca)

	db.rpush(s.REQUEST_QUEUE, json.dumps(d))

	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break

	db.flushdb()
	return jsonify(data)


@app.route("/model/reviewSave", methods=['POST'])
def reviewSave():
	data = {"success": 'none'}
	uid = request.form['uid']
	target = request.form['target']
	samples = request.form['samples']
	dataset = request.form['dataset']
	pca = request.form['pca']

	d = dict(id=uid, uid=uid, target=target,
			 samples=samples, dataset=dataset,
			 pca=pca)

	db.rpush(s.REQUEST_QUEUE, json.dumps(d))

	while True:
		output = db.get(uid)
		if output is not None:
			data = output
			break

	db.flushdb()
	return jsonify(data)



@app.route("/model/cancel", methods=['POST'])
def cancel():
	data = {"success": 'none'}
	uid = request.form['uid']
	target = request.form['target']
	dataset = request.form['dataset']
	pca = request.form['pca']

	d = dict(id=uid, uid=uid, target=target, dataset=dataset, pca=pca)

	db.rpush(s.REQUEST_QUEUE, json.dumps(d))

	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break

	db.flushdb()
	return jsonify(data)


@app.route("/model/label", methods=['POST'])
def label():
	data = {"success": 'none'}
	d = json.loads(request.data)
	uid = d.get('uid')
	db.rpush(s.REQUEST_QUEUE, json.dumps(d))
	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break
	db.flushdb()
	return jsonify(data)

@app.route("/model/count", methods=['POST'])
def count():
	data = {"success": 'none'}
	d = json.loads(request.data)
	uid = d.get('uid')
	db.rpush(s.REQUEST_QUEUE, json.dumps(d))
	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break
	db.flushdb()
	return jsonify(data)

@app.route("/model/map", methods=['POST'])
def map():
	data = {"success": 'none'}
	d = json.loads(request.data)
	uid = d.get('uid')
	db.rpush(s.REQUEST_QUEUE, json.dumps(d))
	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break
	db.flushdb()
	return jsonify(data)

@app.route("/model/params", methods=['POST'])
def label():
	data = {"success": 'none'}
	d = json.loads(request.data)
	uid = d.get('uid')
	db.rpush(s.REQUEST_QUEUE, json.dumps(d))
	while True:
		output = db.get(uid)
		if output is not None:
			data = copy(output)
			break
	db.flushdb()
	return jsonify(data)


if __name__ == "__main__":
	app.run()
