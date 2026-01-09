//
//  OccasionService.swift
//  gifter
//
//  Occasion Service
//

import Foundation

final class OccasionService {
    static let shared = OccasionService()

    private let client = APIClient.shared
    private let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    private init() {}

    // MARK: - Occasions

    func getOccasions() async throws -> [Occasion] {
        let response: OccasionListResponse = try await client.request(OccasionEndpoint.getOccasions)
        return response.occasions.map { $0.toDomain() }
    }

    func createOccasion(
        recipientId: String? = nil,
        type: String,
        title: String? = nil,
        date: Date,
        recurrence: OccasionRecurrence = .none,
        notes: String? = nil
    ) async throws -> Occasion {
        let request = CreateOccasionRequest(
            recipientId: recipientId,
            type: type,
            title: title,
            date: dateFormatter.string(from: date),
            recurrence: recurrence.rawValue,
            notes: notes
        )

        let response: OccasionDTO = try await client.request(OccasionEndpoint.createOccasion(request))
        return response.toDomain()
    }

    func updateOccasion(
        id: String,
        title: String? = nil,
        date: Date? = nil,
        notes: String? = nil,
        recurrence: OccasionRecurrence? = nil
    ) async throws -> Occasion {
        let request = UpdateOccasionRequest(
            title: title,
            date: date.map { dateFormatter.string(from: $0) },
            notes: notes,
            recurrence: recurrence?.rawValue
        )

        let response: OccasionDTO = try await client.request(OccasionEndpoint.updateOccasion(id: id, request))
        return response.toDomain()
    }

    func deleteOccasion(id: String) async throws {
        try await client.request(OccasionEndpoint.deleteOccasion(id: id))
    }
}

// MARK: - Occasion Recurrence
enum OccasionRecurrence: String {
    case none = "NONE"
    case yearly = "YEARLY"
}
