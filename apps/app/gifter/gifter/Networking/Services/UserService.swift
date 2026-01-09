//
//  UserService.swift
//  gifter
//
//  User Profile Service
//

import Foundation

final class UserService {
    static let shared = UserService()

    private let client = APIClient.shared

    private init() {}

    // MARK: - Profile

    func getMe() async throws -> User {
        let response: MeResponse = try await client.request(UserEndpoint.getMe)
        return response.toDomain()
    }

    func updateProfile(name: String? = nil, avatar: String? = nil, timezone: String? = nil, currency: String? = nil) async throws -> User {
        let request = UpdateUserRequest(
            name: name,
            avatar: avatar,
            timezone: timezone,
            defaultCurrency: currency
        )

        let response: MeResponse = try await client.request(UserEndpoint.updateMe(request))
        return response.toDomain()
    }

    // MARK: - Device Registration

    func registerDevice(token: String, platform: String = "ios") async throws {
        try await client.request(UserEndpoint.addDevice(token: token, platform: platform))
    }

    func unregisterDevice(token: String) async throws {
        try await client.request(UserEndpoint.removeDevice(token: token))
    }
}
