import 'package:appwrite/appwrite.dart';
import '../models/user.dart';

class ApiService {
  final Client client = Client();
  late final Databases databases;
  late final Account account;
  late final Storage storage;

  ApiService() {
    client
        .setEndpoint(
          'https://cloud.appwrite.io/v1',
        ) // Replace with your endpoint
        .setProject('') // Replace with your project ID
        .setSelfSigned(status: true); // Remove in production

    databases = Databases(client);
    account = Account(client);
    storage = Storage(client);
  }

  Future<User?> signUp(String name, String email, String password) async {
    try {
      final response = await account.create(
        userId: 'unique()',
        email: email,
        password: password,
        name: name,
      );

      // Create user profile document
      final userId = response.$id;
      await databases.createDocument(
        databaseId: '',
        collectionId: 'users',
        documentId: userId,
        data: {
          'name': name,
          'email': email,
          'createdAt': DateTime.now().toIso8601String(),
          'lastActive': DateTime.now().toIso8601String(),
        },
      );

      // Log in the user after signup
      await account.createEmailPasswordSession(
        email: email,
        password: password,
      );

      return await getUserProfile(userId);
    } catch (e) {
      print('Error creating user: $e');
      return null;
    }
  }

  Future<User?> signIn(String email, String password) async {
    try {
      final response = await account.createEmailPasswordSession(
        email: email,
        password: password,
      );
      print('User signed in successfully: $response');

      // Get user profile after login
      final userId = response.userId;
      return await getUserProfile(userId);
    } catch (e) {
      print('Error signing in: $e');
      return null;
    }
  }

  Future<dynamic> getCurrentSession() async {
    try {
      return await account.getSession(sessionId: 'current');
    } catch (e) {
      print('Error getting current session: $e');
      return null;
    }
  }

  Future<User?> getUserProfile(String userId) async {
    try {
      final document = await databases.getDocument(
        databaseId: '',
        collectionId: 'users',
        documentId: userId,
      );
      return User.fromJson(document.data);
    } catch (e) {
      print('Error getting user profile: $e');
      return null;
    }
  }

  Future<void> signOut() async {
    try {
      await account.deleteSession(sessionId: 'current');
    } catch (e) {
      print('Error signing out: $e');
    }
  }

  Future<UserWallet> verifyWalletSignature(
    String address,
    String blockchainType,
    String signature,
  ) async {
    // In a real app, this would verify the signature with blockchain
    // For now, we'll simulate wallet verification
    return UserWallet(
      address: address,
      blockchainType: blockchainType,
      isVerified: true,
    );
  }

  Future<void> createDocument(
    String collectionId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await databases.createDocument(
        databaseId: '',
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
        databaseId: '',
        collectionId: collectionId,
        documentId: documentId,
      );
      print('Document retrieved successfully: $response');
    } catch (e) {
      print('Error retrieving document: $e');
    }
  }

  Future<void> updateDocument(
    String collectionId,
    String documentId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await databases.updateDocument(
        databaseId: '',
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
        databaseId: '',
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
        bucketId: '',
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
      final response = await storage.getFile(bucketId: '', fileId: fileId);
      print('File retrieved successfully: $response');
    } catch (e) {
      print('Error retrieving file: $e');
    }
  }
}
