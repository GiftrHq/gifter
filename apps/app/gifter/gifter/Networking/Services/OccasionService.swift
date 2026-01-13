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

    func getOccasionFeed(days: Int = 30) async throws -> OccasionFeed {
        let response: OccasionFeedResponse = try await client.request(OccasionEndpoint.getFeed(days: days))
        return OccasionFeed(
            nextTwoWeeks: response.nextTwoWeeks.map { $0.toDomain() },
            later: response.later.map { $0.toDomain() }
        )
    }

    func createOccasion(
        recipientId: String? = nil,
        type: String,
        title: String? = nil,
        date: Date,
        recurrence: OccasionRecurrence = .none,
        visibility: OccasionVisibility = .publicVisibility,
        sharedWithUserIds: [String]? = nil,
        notes: String? = nil
    ) async throws -> Occasion {
        let request = CreateOccasionRequest(
            recipientId: recipientId,
            type: type,
            title: title,
            date: dateFormatter.string(from: date),
            recurrence: recurrence.rawValue,
            visibility: visibility.rawValue,
            sharedWithUserIds: sharedWithUserIds,
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
        recurrence: OccasionRecurrence? = nil,
        visibility: OccasionVisibility? = nil,
        sharedWithUserIds: [String]? = nil
    ) async throws -> Occasion {
        let request = UpdateOccasionRequest(
            title: title,
            date: date.map { dateFormatter.string(from: $0) },
            notes: notes,
            recurrence: recurrence?.rawValue,
            visibility: visibility?.rawValue,
            sharedWithUserIds: sharedWithUserIds
        )

        let response: OccasionDTO = try await client.request(OccasionEndpoint.updateOccasion(id: id, request))
        return response.toDomain()
    }

    func deleteOccasion(id: String) async throws {
        try await client.request(OccasionEndpoint.deleteOccasion(id: id))
    }
}

// MARK: - Helper Models

struct OccasionFeed {
    let nextTwoWeeks: [Occasion]
    let later: [Occasion]
}

struct OccasionFeedResponse: Decodable {
    let nextTwoWeeks: [OccasionDTO]
    let later: [OccasionDTO]
}

// MARK: - Occasion Recurrence
enum OccasionRecurrence: String {
    case none = "NONE"
    case yearly = "YEARLY"
}
