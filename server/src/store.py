import json


class Store:
    def __init__(self, filename):
        self.filename = filename
        try:
            loaded = open(self.filename, 'r+').read()
        except FileNotFoundError:
            loaded = None
        self.store = json.loads(loaded or '{}')

    def put(self, key, value):
        self.store[key] = value
        self.save()

    def get(self, key):
        if key in self.store:
            return self.store[key]
        else:
            return None

    def save(self):
        json.dump(self.store, open(self.filename, 'w'))
