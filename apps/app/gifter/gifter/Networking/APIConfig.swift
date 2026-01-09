//
//  APIConfig.swift
//  gifter
//
//  API Configuration and Environment
//

import Foundation

enum APIEnvironment {
    case development
    case staging
    case production

    var baseURL: String {
        switch self {
        case .development:
            return "http://localhost:4000"
        case .staging:
            return "https://api-staging.atgifter.com"
        case .production:
            return "https://api.atgifter.com"
        }
    }
}

struct APIConfig {
    static let shared = APIConfig()

    #if DEBUG
    let environment: APIEnvironment = .development
    #else
    let environment: APIEnvironment = .production
    #endif

    var baseURL: URL {
        URL(string: environment.baseURL)!
    }

    // API version prefix
    let apiVersion = "v1"

    // Timeouts
    let requestTimeout: TimeInterval = 30
    let resourceTimeout: TimeInterval = 60

    // Headers
    var defaultHeaders: [String: String] {
        [
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Origin": environment.baseURL,
            "X-Client-Platform": "ios",
            "X-Client-Version": Bundle.main.appVersion
        ]
    }

    private init() {}
}

// MARK: - Bundle Extension
extension Bundle {
    var appVersion: String {
        (infoDictionary?["CFBundleShortVersionString"] as? String) ?? "1.0.0"
    }

    var buildNumber: String {
        (infoDictionary?["CFBundleVersion"] as? String) ?? "1"
    }
}
