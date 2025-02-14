import 'package:appwrite/appwrite.dart';

class ApiService {
  Client client;
  Account account;
  Databases databases;
  Storage storage;

  ApiService()
      : client = Client(),
        account = Account(Client()),
        databases = Databases(Client()),
        storage = Storage(Client()) {
    client.setProject('67aed8360001b6dd8cb3'); // Your project ID
  }

  Future<void> signUp(String email, String password) async {
    try {
      final response = await account.create(
        userId: 'unique()',
        email: email,
        password: password,
      );
      print('User created successfully: $response');
    } catch (e) {
      print('Error creating user: $e');
    }
  }

  Future<void> signIn(String email, String password) async {
    try {
      final response = await account.createSession(
        email: email,
        password: password,
      );
      print('User signed in successfully: $response');
    } catch (e) {
      print('Error signing in: $e');
    }
  }

  Future<void> createDocument(
      String collectionId, Map<String, dynamic> data) async {
    try {
      final response = await databases.createDocument(
        databaseId: '67aed8360001b6dd8cb3',
        collectionId: collectionId,
        documentId: 'unique()',
        data: data,
      );
      print('Document created successfully: $response');
    } catch (e) {
      print('Error creating document: $e');
    }
  }

  Future<void> getDocument(String collectionId, String documentId) async {
    try {
      final response = await databases.getDocument(
        databaseId: '67aed8360001b6dd8cb3',
        collectionId: collectionId,
        documentId: documentId,
      );
      print('Document retrieved successfully: $response');
    } catch (e) {
      print('Error retrieving document: $e');
    }
  }

  Future<void> updateDocument(
      String collectionId, String documentId, Map<String, dynamic> data) async {
    try {
      final response = await databases.updateDocument(
        databaseId: '67aed8360001b6dd8cb3',
        collectionId: collectionId,
        documentId: documentId,
        data: data,
      );
      print('Document updated successfully: $response');
    } catch (e) {
      print('Error updating document: $e');
    }
  }

  Future<void> deleteDocument(String collectionId, String documentId) async {
    try {
      final response = await databases.deleteDocument(
        databaseId: '67aed8360001b6dd8cb3',
        collectionId: collectionId,
        documentId: documentId,
      );
      print('Document deleted successfully: $response');
    } catch (e) {
      print('Error deleting document: $e');
    }
  }

  Future<void> uploadFile(String path) async {
    try {
      final response = await storage.createFile(
        bucketId: '67aed8360001b6dd8cb3',
        fileId: 'unique()',
        file: InputFile(path: path),
      );
      print('File uploaded successfully: $response');
    } catch (e) {
      print('Error uploading file: $e');
    }
  }

  Future<void> getFile(String fileId) async {
    try {
      final response = await storage.getFile(
        bucketId: '67aed8360001b6dd8cb3',
        fileId: fileId,
      );
      print('File retrieved successfully: $response');
    } catch (e) {
      print('Error retrieving file: $e');
    }
  }
}
