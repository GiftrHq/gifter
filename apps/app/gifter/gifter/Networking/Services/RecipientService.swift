//
//  RecipientService.swift
//  gifter
//
//  Recipient Service
//

import Foundation

final class RecipientService {
    static let shared = RecipientService()

    private let client = APIClient.shared
    private let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    private init() {}

    // MARK: - Recipients

    func getRecipients() async throws -> [GiftingProfile] {
        let response: RecipientListResponse = try await client.request(RecipientEndpoint.getRecipients)
        return response.recipients.map { $0.toDomain() }
    }

    func createRecipient(
        name: String,
        relationship: String? = nil,
        birthday: Date? = nil,
        notes: String? = nil
    ) async throws -> GiftingProfile {
        let request = CreateRecipientRequest(
            name: name,
            relationship: relationship,
            birthday: birthday.map { dateFormatter.string(from: $0) },
            notes: notes
        )

        let response: RecipientDTO = try await client.request(RecipientEndpoint.createRecipient(request))
        return response.toDomain()
    }

    func updateRecipient(
        id: String,
        name: String? = nil,
        relationship: String? = nil,
        birthday: Date? = nil,
        notes: String? = nil
    ) async throws -> GiftingProfile {
        let request = UpdateRecipientRequest(
            name: name,
            relationship: relationship,
            birthday: birthday.map { dateFormatter.string(from: $0) },
            notes: notes
        )

        let response: RecipientDTO = try await client.request(RecipientEndpoint.updateRecipient(id: id, request))
        return response.toDomain()
    }

    func deleteRecipient(id: String) async throws {
        try await client.request(RecipientEndpoint.deleteRecipient(id: id))
    }
}
