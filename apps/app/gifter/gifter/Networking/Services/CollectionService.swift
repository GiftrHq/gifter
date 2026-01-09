//
//  CollectionService.swift
//  gifter
//
//  Collection Service
//

import Foundation

final class CollectionService {
    static let shared = CollectionService()

    private let client = APIClient.shared

    private init() {}

    // MARK: - Collections

    func getCollections(limit: Int = 10) async throws -> [GiftCollection] {
        let response: CollectionListResponse = try await client.request(
            CollectionEndpoint.getCollections(limit: limit)
        )

        return response.collections.map { $0.toDomain() }
    }

    func getCollection(id: String) async throws -> GiftCollection {
        let response: CollectionDetailResponse = try await client.request(
            CollectionEndpoint.getCollection(id: id)
        )

        let products = response.products?.map { $0.toDomain() } ?? []
        return response.collection.toDomain(products: products)
    }

    func getCollectionProducts(
        id: String,
        limit: Int = 20,
        offset: Int = 0
    ) async throws -> (products: [Product], hasMore: Bool) {
        let response: CollectionProductsResponse = try await client.request(
            CollectionEndpoint.getCollectionProducts(id: id, limit: limit, offset: offset)
        )

        return (
            products: response.products.map { $0.toDomain() },
            hasMore: response.hasMore
        )
    }
}
