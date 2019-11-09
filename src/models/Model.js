/**
 * @abstract
 */
class Model {
  /**
   * Model constructor.
   * @param mongo {MongoClient} Mongo client.
   * @param collection {string} Collection name used by this model.
   */
  constructor (mongo, collection) {
    this.collection = mongo.collection(collection);
  }

  /**
   * Fetches an entry by its ID.
   * @param query {*} Object or anything that is a valid id.
   * @returns {Promise<object|null>} The document, if found.
   */
  find (query) {
    if (typeof query === 'string') {
      query = { _id: query };
    }
    return this.collection.findOne(query);
  }

  /**
   * Fetches all entries matching a specified query.
   * @param query {object} The query.
   * @returns {Promise<object[]>} Documents.
   */
  findAll (query = {}) {
    return this.collection.find(query).toArray();
  }

  /**
   * Creates a document.
   * @param document {object} Document to insert.
   * @returns {Promise<object>} An object with document id and other stuff.
   */
  create (document) {
    return this.collection.insertOne(document);
  }

  /**
   * Updates a document
   * @param query {*} Object or anything that is a valid id.
   * @param data
   * @param returnDoc {Boolean} Whether or not the document updated should be returned.
   * @returns {Promise<void|object>} The updated document, if returnDoc is true.
   */
  update (query, data, returnDoc) {
    if (typeof query === 'string') {
      query = { _id: query };
    }
    if (returnDoc) {
      return this.collection.findOneAndUpdate(query, { $set: data }, { returnOriginal: true });
    }
    this.collection.updateOne(query, { $set: data });
  }

  /**
   * Replaces a document by another
   * @param query {*} Object or anything that is a valid id.
   * @param document
   */
  replace (query, document) {
    if (typeof query === 'string') {
      query = { _id: query };
    }
    this.collection.updateOne(query, document);
  }

  /**
   * Deletes a document
   * @param query {*} Object or anything that is a valid id.
   * @returns Promise<void>
   */
  delete (query) {
    if (typeof query === 'string') {
      query = { _id: query };
    }
    return this.collection.deleteOne(query);
  }
}

module.exports = Model;
