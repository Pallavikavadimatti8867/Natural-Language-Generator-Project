"""
Database configuration and helpers for MongoDB and mock fallback
"""
import os
from pymongo import MongoClient

class Database:
    _instance = None
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        if cls._db is None:
            mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/nlg_analytics_db')
            try:
                cls._client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
                cls._client.server_info()  # trigger connection check
                cls._db = cls._client['nlg_analytics_db']
                print("Connected to MongoDB successfully.")
            except Exception as e:
                print(f"MongoDB not connected ({e}), using in-memory mock store.")
                from collections import defaultdict
                class MockCollection:
                    def __init__(self):
                        self.data = []
                    def insert_one(self, doc):
                        import uuid
                        if '_id' not in doc:
                            doc['_id'] = str(uuid.uuid4())
                        self.data.append(doc)
                        return type('Res', (), {'inserted_id': doc['_id']})
                    def find(self, query=None):
                        res = self.data
                        if query:
                            res = [d for d in self.data if all(d.get(k) == v for k, v in query.items())]
                        return res
                    def find_one(self, query):
                        for d in self.data:
                            if all(d.get(k) == v for k, v in query.items()):
                                return d
                        return None
                    def delete_one(self, query):
                        for i, d in enumerate(self.data):
                            if all(d.get(k) == v for k, v in query.items()):
                                del self.data[i]
                                return type('Del', (), {'deleted_count': 1})
                        return type('Del', (), {'deleted_count': 0})

                class MockDB:
                    def __init__(self):
                        self.cols = defaultdict(MockCollection)
                    def __getitem__(self, name):
                        return self.cols[name]
                cls._db = MockDB()

        return cls._db
