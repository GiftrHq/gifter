//
//  NetworkError.swift
//  gifter
//
//  Network Error Types
//

import Foundation

enum NetworkError: LocalizedError {
    case invalidURL
    case noData
    case decodingError(Error)
    case encodingError(Error)
    case httpError(statusCode: Int, message: String?)
    case unauthorized
    case forbidden
    case notFound
    case serverError(String?)
    case networkUnavailable
    case timeout
    case unknown(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .encodingError(let error):
            return "Failed to encode request: \(error.localizedDescription)"
        case .httpError(let statusCode, let message):
            return message ?? "HTTP error \(statusCode)"
        case .unauthorized:
            return "Please log in to continue"
        case .forbidden:
            return "You don't have permission to access this"
        case .notFound:
            return "Resource not found"
        case .serverError(let message):
            return message ?? "Server error occurred"
        case .networkUnavailable:
            return "No internet connection"
        case .timeout:
            return "Request timed out"
        case .unknown(let error):
            return error.localizedDescription
        }
    }

    var isAuthError: Bool {
        switch self {
        case .unauthorized, .forbidden:
            return true
        default:
            return false
        }
    }
}

// MARK: - API Error Response
struct APIErrorResponse: Decodable {
    let message: String?
    let error: String?
    let statusCode: Int?

    var displayMessage: String {
        message ?? error ?? "An error occurred"
    }
}
