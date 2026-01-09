//
//  SessionManager.swift
//  gifter
//
//  Session and Cookie Management for BetterAuth
//

import Foundation

actor SessionManager {
    static let shared = SessionManager()

    private let userDefaults = UserDefaults.standard
    private let sessionKey = "com.gifter.session"
    private let userKey = "com.gifter.user"
    private let tokenKey = "com.gifter.token"

    private var cachedSession: SessionDTO?
    private var cachedUser: UserDTO?
    private var cachedToken: String?

    private init() {
        // Load cached session on init (synchronously since UserDefaults is sync)
        if let sessionData = userDefaults.data(forKey: sessionKey),
           let session = try? JSONDecoder().decode(SessionDTO.self, from: sessionData) {
            cachedSession = session
            #if DEBUG
            print("SessionManager.init: Loaded session from cache")
            #endif
        }

        if let userData = userDefaults.data(forKey: userKey),
           let user = try? JSONDecoder().decode(UserDTO.self, from: userData) {
            cachedUser = user
            #if DEBUG
            print("SessionManager.init: Loaded user from cache - \(user.email)")
            #endif
        }

        if let token = userDefaults.string(forKey: tokenKey) {
            cachedToken = token
            #if DEBUG
            print("SessionManager.init: Loaded token from cache - \(token.prefix(8))...")
            #endif
        }

        #if DEBUG
        print("SessionManager.init: token=\(cachedToken != nil), user=\(cachedUser != nil), session=\(cachedSession != nil)")
        #endif
    }

    // MARK: - Session Management

    func saveSession(_ session: SessionDTO, user: UserDTO) {
        cachedSession = session
        cachedUser = user
        cachedToken = nil

        // Persist to UserDefaults
        if let sessionData = try? JSONEncoder().encode(session) {
            userDefaults.set(sessionData, forKey: sessionKey)
        }
        if let userData = try? JSONEncoder().encode(user) {
            userDefaults.set(userData, forKey: userKey)
        }
        userDefaults.removeObject(forKey: tokenKey)
    }

    /// Save token-based auth (BetterAuth returns token instead of full session)
    func saveToken(_ token: String, user: UserDTO) {
        cachedToken = token
        cachedUser = user
        cachedSession = nil

        #if DEBUG
        print("SessionManager.saveToken: Saving token \(token.prefix(8))... for user \(user.email)")
        #endif

        // Persist to UserDefaults
        userDefaults.set(token, forKey: tokenKey)
        if let userData = try? JSONEncoder().encode(user) {
            userDefaults.set(userData, forKey: userKey)
            #if DEBUG
            print("SessionManager.saveToken: User data saved successfully")
            #endif
        } else {
            #if DEBUG
            print("SessionManager.saveToken: Failed to encode user data!")
            #endif
        }
        userDefaults.removeObject(forKey: sessionKey)
        userDefaults.synchronize() // Force immediate write
    }

    func getSession() -> SessionDTO? {
        cachedSession
    }

    func getToken() -> String? {
        cachedToken
    }

    func getUser() -> UserDTO? {
        cachedUser
    }

    func clearSession() {
        cachedSession = nil
        cachedUser = nil
        cachedToken = nil
        userDefaults.removeObject(forKey: sessionKey)
        userDefaults.removeObject(forKey: userKey)
        userDefaults.removeObject(forKey: tokenKey)

        // Clear cookies
        clearCookies()
    }

    func isSessionValid() -> Bool {
        // Valid if we have a token or a non-expired session
        #if DEBUG
        print("SessionManager.isSessionValid: token=\(cachedToken != nil), user=\(cachedUser != nil), session=\(cachedSession != nil)")
        #endif

        if cachedToken != nil && cachedUser != nil {
            #if DEBUG
            print("SessionManager.isSessionValid: returning true (has token + user)")
            #endif
            return true
        }
        guard let session = cachedSession else {
            #if DEBUG
            print("SessionManager.isSessionValid: returning false (no session)")
            #endif
            return false
        }
        let isValid = session.expiresAt > Date()
        #if DEBUG
        print("SessionManager.isSessionValid: returning \(isValid) (session expires: \(session.expiresAt))")
        #endif
        return isValid
    }

    // MARK: - Private Methods

    private func clearCookies() {
        let cookieStorage = HTTPCookieStorage.shared
        guard let baseURL = URL(string: APIConfig.shared.baseURL.absoluteString) else { return }

        if let cookies = cookieStorage.cookies(for: baseURL) {
            for cookie in cookies {
                cookieStorage.deleteCookie(cookie)
            }
        }
    }
}

// MARK: - Keychain Helper (for sensitive data)
final class KeychainHelper {
    static let shared = KeychainHelper()

    private let service = "com.gifter.keychain"

    private init() {}

    func save(_ data: Data, forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        // Delete existing item
        SecItemDelete(query as CFDictionary)

        // Add new item
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.unableToSave
        }
    }

    func load(forKey key: String) throws -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                return nil
            }
            throw KeychainError.unableToLoad
        }

        return result as? Data
    }

    func delete(forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.unableToDelete
        }
    }

    enum KeychainError: Error {
        case unableToSave
        case unableToLoad
        case unableToDelete
    }
}
