//
//  APIClient.swift
//  gifter
//
//  Core API Client with URLSession
//

import Foundation

actor APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let config = APIConfig.shared
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = config.requestTimeout
        configuration.timeoutIntervalForResource = config.resourceTimeout
        configuration.httpCookieAcceptPolicy = .always
        configuration.httpShouldSetCookies = true
        configuration.httpCookieStorage = HTTPCookieStorage.shared

        self.session = URLSession(configuration: configuration)

        // Use default key strategy - BetterAuth returns camelCase
        self.decoder = JSONDecoder()

        self.encoder = JSONEncoder()
    }

    // MARK: - Public API

    /// Execute a request and decode the response
    func request<T: Decodable>(_ endpoint: APIEndpoint) async throws -> T {
        let request = try await buildRequest(for: endpoint)
        let (data, response) = try await performRequest(request)
        try validateResponse(response, data: data)
        return try decode(data)
    }

    /// Execute a request without expecting a response body
    func request(_ endpoint: APIEndpoint) async throws {
        let request = try await buildRequest(for: endpoint)
        let (data, response) = try await performRequest(request)
        try validateResponse(response, data: data)
    }

    /// Execute a request and return raw data
    func requestData(_ endpoint: APIEndpoint) async throws -> Data {
        let request = try await buildRequest(for: endpoint)
        let (data, response) = try await performRequest(request)
        try validateResponse(response, data: data)
        return data
    }

    // MARK: - Private Methods

    private func buildRequest(for endpoint: APIEndpoint) async throws -> URLRequest {
        guard var urlComponents = URLComponents(
            url: config.baseURL.appendingPathComponent(endpoint.path),
            resolvingAgainstBaseURL: true
        ) else {
            throw NetworkError.invalidURL
        }

        // Add query items
        if let queryItems = endpoint.queryItems, !queryItems.isEmpty {
            urlComponents.queryItems = queryItems
        }

        guard let url = urlComponents.url else {
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue

        // Encode body first to check if we have one
        var hasBody = false
        if let body = endpoint.body {
            request.httpBody = try encodeBody(body)
            hasBody = true
        }

        // Add default headers (skip Content-Type if no body)
        for (key, value) in config.defaultHeaders {
            if key == "Content-Type" && !hasBody {
                continue // Don't set Content-Type if there's no body
            }
            request.setValue(value, forHTTPHeaderField: key)
        }

        // Add endpoint-specific headers
        if let headers = endpoint.headers {
            for (key, value) in headers {
                request.setValue(value, forHTTPHeaderField: key)
            }
        }

        // Add Authorization header if endpoint requires auth and we have a token
        if endpoint.requiresAuth {
            if let token = await SessionManager.shared.getToken() {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            }
        }

        return request
    }

    private func performRequest(_ request: URLRequest) async throws -> (Data, URLResponse) {
        do {
            return try await session.data(for: request)
        } catch let error as URLError {
            switch error.code {
            case .notConnectedToInternet, .networkConnectionLost:
                throw NetworkError.networkUnavailable
            case .timedOut:
                throw NetworkError.timeout
            default:
                throw NetworkError.unknown(error)
            }
        } catch {
            throw NetworkError.unknown(error)
        }
    }

    private func validateResponse(_ response: URLResponse, data: Data) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.unknown(NSError(domain: "Invalid response", code: 0))
        }

        switch httpResponse.statusCode {
        case 200...299:
            return // Success
        case 401:
            // Clear session on unauthorized
            Task {
                await SessionManager.shared.clearSession()
            }
            throw NetworkError.unauthorized
        case 403:
            throw NetworkError.forbidden
        case 404:
            throw NetworkError.notFound
        case 400...499:
            let errorResponse = try? decoder.decode(APIErrorResponse.self, from: data)
            throw NetworkError.httpError(
                statusCode: httpResponse.statusCode,
                message: errorResponse?.displayMessage
            )
        case 500...599:
            let errorResponse = try? decoder.decode(APIErrorResponse.self, from: data)
            throw NetworkError.serverError(errorResponse?.displayMessage)
        default:
            throw NetworkError.httpError(statusCode: httpResponse.statusCode, message: nil)
        }
    }

    private func decode<T: Decodable>(_ data: Data) throws -> T {
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            #if DEBUG
            if let json = String(data: data, encoding: .utf8) {
                print("Failed to decode response: \(json)")
                print("Decoding error: \(error)")
            }
            #endif
            throw NetworkError.decodingError(error)
        }
    }

    private func encodeBody(_ body: Encodable) throws -> Data {
        do {
            return try encoder.encode(AnyEncodable(body))
        } catch {
            throw NetworkError.encodingError(error)
        }
    }
}

// MARK: - Type Erasure for Encodable
private struct AnyEncodable: Encodable {
    private let encodeClosure: (Encoder) throws -> Void

    init(_ wrapped: Encodable) {
        encodeClosure = wrapped.encode
    }

    func encode(to encoder: Encoder) throws {
        try encodeClosure(encoder)
    }
}

// MARK: - Convenience Extensions
extension APIClient {
    /// Helper for auth endpoints that save session
    func authenticate(_ endpoint: AuthEndpoint) async throws -> User {
        // Get raw data first for debugging
        let data = try await requestData(endpoint)

        #if DEBUG
        if let json = String(data: data, encoding: .utf8) {
            print("Auth response JSON: \(json)")
        }
        #endif

        let response = try decoder.decode(AuthResponse.self, from: data)

        #if DEBUG
        print("Decoded response - user: \(String(describing: response.user)), session: \(String(describing: response.session)), token: \(String(describing: response.token))")
        #endif

        guard let user = response.user else {
            throw NetworkError.noData
        }

        // BetterAuth returns token instead of full session object
        // Save token and user for session management
        if let token = response.token {
            await SessionManager.shared.saveToken(token, user: user)
        } else if let session = response.session {
            await SessionManager.shared.saveSession(session, user: user)
        }

        return user.toDomain()
    }

    /// Get current session from API
    func getSession() async throws -> User? {
        let response: GetSessionResponse = try await request(AuthEndpoint.getSession)

        if let session = response.session, let user = response.user {
            await SessionManager.shared.saveSession(session, user: user)
            return user.toDomain()
        }

        return nil
    }

    /// Sign out and clear session
    func signOut() async throws {
        try await request(AuthEndpoint.signOut)
        await SessionManager.shared.clearSession()
    }
}
